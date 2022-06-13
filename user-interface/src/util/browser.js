import pRetry from 'p-retry'
import pTimeout from 'p-timeout'
import puppeteer from 'puppeteer'

import { TEMPLATES_PATH } from './constants.js'
import { logException, logger, panic } from './logging.js'
import {
  TaskWebBasic,
  TaskWebSeries,
  TaskYouTube,
  TaskGoogleSlides
} from '../tasks/index.js'

class Browser {
  ready = false
  launchFlags = {
    // executablePath: process.env.CHROMIUM_PATH,
    headless: false,
    defaultViewport: null,
    ignoreDefaultArgs: [
      '--enable-automation' // Disables warning banner
    ],
    args: [
      // '--crash-test', // Forces Chromium to crash upon launch
      '--kiosk', // Simple full-screen view
      '--disable-notifications', // Disables permission requests
      '--noerrdialogs', // Suppresses error dialogs if presented
      // Crash if the UI or IO thread hangs for 30 seconds or more
      // (forces Chromium to restart and fix itself)
      '--crash-on-hang-threads=UI:30,IO:30'
    ]
  }

  constructor (parent) {
    this.parent = parent

    // Launch browser puppet
    this.launchPuppet()
  }

  /**
   * Launches the browser puppet window
   */
  async launchPuppet () {
    // Launch the browser
    try {
      this.puppet = await pRetry(async () => {
        try {
          return await puppeteer.launch(this.launchFlags)
        } catch (e) {
          console.log(e)
          // Puppeteer throws an object by default
          throw e.error
        }
      }, { retries: 1 })
    } catch (e) {
      panic(e, 'Unable to launch browser puppet')
    }

    // If the browser window disconnects (exits), relaunch the browser
    this.puppet.on('disconnected', () => pRetry(() => this.relaunchPuppet()))

    // Grab the initial page that is created upon launch
    let pages
    try {
      // If there an issue w/ the browser .pages() won't timeout
      // so a timeout is needed to recover if this occurs somehow
      pages = await pRetry(async () => pTimeout(this.puppet.pages(), 5000), { retries: 2 })
    } catch (e) {
      panic(e, 'Unable to load browser pages')
    }
    this.mainPage = pages[0]

    // Load the pending page
    try {
      await pTimeout(this.mainPage.goto(`file://${TEMPLATES_PATH}/pending.html`), 30 * 1000)
    } catch (e) {
      logException(e, `Unable to goto pending page: ${e}`)
    }

    // Set the Browser as ready
    this.ready = true
  }

  /**
   * Closes the existing puppet, relaunches and sets the task back up
   */
  async relaunchPuppet () {
    logger.info('Browser disconnected, relaunching browser')

    // Close the existing puppet if applicable
    try {
      await pRetry(() => this.puppet.close())
    } catch (e) {
      logException(e, `Unable to close existing puppet: ${e}`)
    }

    // Relaunch the browser
    try {
      await pRetry(() => this.launchPuppet())
    } catch (e) {
      panic(e, 'Unable to relaunch browser')
    }

    // Reload existing task
    try {
      await pRetry(() => this.update())
    } catch (e) {
      logException(e, `Unable to update task: ${e}`)
    }
  }

  /**
   * Handles updating the task assigned if a change is detected
   *
   * @returns {Promise<void>}
   */
  async update () {
    // Cleanup old task handler
    if (this.taskHandler) {
      try {
        await this.taskHandler.cleanUp()
      } catch (e) {
        logException(e, 'Unable to cleanup existing task handler')
      }
    }

    // Setup task handler
    switch (this.parent.task.type) {
      case 'web-basic':
        this.taskHandler = new TaskWebBasic(this)
        break
      case 'web-series':
        this.taskHandler = new TaskWebSeries(this)
        break
      case 'youtube':
        this.taskHandler = new TaskYouTube(this)
        break
      case 'google-slides':
        this.taskHandler = new TaskGoogleSlides(this)
        break
      default:
        logException(
          new Error(`Unsupported task type: ${this.parent.task.type}`),
          'Unable to update task'
        )
        return
    }

    // Initialize the task
    try {
      await this.taskHandler.initialize()
    } catch (e) {
      logException(e, `Unable to initialize task during task update: ${e}`)
    }

    // Update the browser state
    return this.taskHandler.update()
  }
}

export default Browser
