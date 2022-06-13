import fetch from 'node-fetch'
import pRetry from 'p-retry'
import pTimeout from 'p-timeout'

import Browser from './browser.js'
import { loadConfiguration } from './config.js'
import sleep from './sleep.js'
import { BROWSER_LAUNCH_TIMEOUT_SECONDS, TEMPLATES_PATH } from './constants.js'
import { panic, logException } from './logging.js'

class DigitalSignage {
  timers = {}

  /**
   * Starts the application
   */
  async start () {
    // Load the configuration
    try {
      this.config = await loadConfiguration()
    } catch (e) {
      panic(e, 'Unable to load configuration')
    }

    // Set basic auth header & start the browser
    this.headers = { Authorization: `Basic ${this.config.authToken}` }
    this.browser = new Browser(this)

    // Wait until the browser is ready
    let launchTime = 0
    while (!this.browser.ready) {
      if (launchTime >= BROWSER_LAUNCH_TIMEOUT_SECONDS) {
        panic(new Error(`Browser failed to launch within timeout window of: ${BROWSER_LAUNCH_TIMEOUT_SECONDS} seconds`))
      }
      await sleep(1000)
      launchTime += 1
    }

    // Load the latest task if possible
    if (await this.loadTask()) {
      // Set the browser state as needed
      await pRetry(() => this.browser.update())
    }

    // Start an update timer (15s)
    this.timers.update = setInterval(async () => {
      if (await this.loadTask()) {
        // Set the browser state as needed
        await pRetry(() => this.browser.update())
      }
    }, 15000)

    // Start a heartbeat timer (1m)
    this.timers.heartbeat = setInterval(() => {
      this.submitHeartbeat()
    }, 60000)
  }

  /**
   * Submit a heartbeat so the Dashboard knows this Device is online
   */
  async submitHeartbeat () {
    try {
      await fetch(`${this.config.apiUrl}signs/heartbeat/${this.config.id}`, { headers: this.headers })
    } catch (e) {
      logException(e, `Unable to send heartbeat: ${e}`)
    }
  }

  /**
   * Loads the assigned task via a Custom Function and detects if it is new
   *
   * @returns {Promise<boolean>} new task is detected
   */
  async loadTask () {
    // Save the current Task ID for comparison later
    const existingTaskId = this.task?.id ? this.task.id : null

    // Load the latest assigned task
    let deviceInfo
    try {
      const req = await fetch(`${this.config.apiUrl}signs/device/${this.config.id}`, { headers: this.headers })
      deviceInfo = await req.json()
    } catch (e) {
      logException(e, `Unable to load task: ${e}`)
      return false
    }

    // Ensure we have a task assigned
    if (!deviceInfo.sign) {
      try {
        await pRetry(() => pTimeout(this.browser.mainPage.goto(`file://${TEMPLATES_PATH}/no_assignment.html`), 30 * 1000))
      } catch (e) {
        logException(e, `Unable to goto no assignment page: ${e}`)
      }
      return
    }

    // Update the active task and only trigger an update if there was a change in tasks
    this.task = deviceInfo.sign
    return existingTaskId !== this.task.id
  }

  /**
   * Closes the application
   */
  async close () {
    // Remove the timers
    Object.keys(this.timers).forEach(timer => clearInterval(this.timers[timer]))

    // Close the browser
    try {
      await pRetry(() => this.browser.puppet.close())
    } catch (e) {
      panic(e, 'Unable to close browser puppet')
    }
  }
}

export default DigitalSignage
