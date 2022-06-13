import pRetry from 'p-retry'
import pTimeout from 'p-timeout'

import Task from './task.js'
import { logException, panic } from '../util/logging.js'

class TaskWebBasic extends Task {
  page = null

  /**
   * Setup the tab and timer
   */
  async initialize () {
    // Create the new page
    try {
      this.page = await pRetry(() => pTimeout(this.browser.puppet.newPage(), 5000))
    } catch (e) {
      panic(e, 'Unable to create new page')
    }

    // Setup a timer to refresh the page if configured
    if (this.browser.parent.task.metadata.refreshTimer) {
      this.timer = setInterval(() => this.update(), this.browser.parent.task.metadata.refreshTimer * 60 * 1000)
    }
  }

  /**
   * Handle updating the task when a change is detected
   */
  async update () {
    // Update browser state
    try {
      await pRetry(() => pTimeout(this.page.goto(this.browser.parent.task.metadata.url), 15000))
    } catch (e) {
      panic(e, 'Unable to navigate')
    }
  }

  /**
   * Cleans up the page created
   */
  async cleanUp () {
    // Remove the timer if setup
    if (this.timer) clearInterval(this.timer)

    // Remove the page
    if (this.page) {
      try {
        await pRetry(() => pTimeout(this.page.close(), 5000))
      } catch (e) {
        logException(e, `Unable to close page: ${e}`)
      }
    }
  }
}

export default TaskWebBasic
