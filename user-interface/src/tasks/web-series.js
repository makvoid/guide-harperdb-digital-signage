import async from 'async'
import pRetry from 'p-retry'
import pTimeout from 'p-timeout'

import Task from './task.js'
import { logException, panic } from '../util/logging.js'

class TaskWebSeries extends Task {
  activeTab = 0
  pages = []

  /**
   * Setup the pages required by the task
   */
  async initialize () {
    // Create the new pages
    this.pages = await async.map(this.browser.parent.task.metadata.urls, async () => {
      try {
        return await pRetry(() => pTimeout(this.browser.puppet.newPage(), 5000))
      } catch (e) {
        panic(e, 'Unable to create new page')
      }
    })
  }

  /**
   * Handles updating the task if a change is detected
   */
  async update () {
    // Clear any existing timer running
    clearTimeout(this.timer)

    // Loop through each URL and have it's tab load it
    await async.eachOf(this.browser.parent.task.metadata.urls, async (part, index) => {
      try {
        await pRetry(() => pTimeout(this.pages[index].goto(part.url), 15000))
      } catch (e) {
        panic(e, 'Unable to navigate')
      }
    })

    // Bring the first URL to focus
    try {
      await this.pages[0].bringToFront()
    } catch (e) {
      logException(e, `Unable to bring first tab to front: ${e}`)
    }

    // Start the fist tab's timer
    this.timer = setTimeout(() => this.tabTimer(), this.browser.parent.task.metadata.urls[0].timer * 1000)
    this.activeTab = 0
  }

  /**
   * Tab timing logic, handle changing the page
   */
  async tabTimer () {
    // Set the new active tab
    this.activeTab = this.activeTab + 1 > this.pages.length - 1 ? 0 : this.activeTab + 1

    // Bring the tab to focus
    try {
      await this.pages[this.activeTab].bringToFront()
    } catch (e) {
      logException(e, `Unable to bring tab to front: ${e}`)
    }

    // Create a timer for moving to the next tab
    this.timer = setTimeout(() => this.tabTimer(), this.browser.parent.task.metadata.urls[this.activeTab].timer * 1000)
  }

  /**
   * Clean up logic, removes the timer and pages
   */
  async cleanUp () {
    // Remove any timer
    if (this.timer) clearTimeout(this.timer)

    // Close all pages
    await async.each(this.pages, async (page) => {
      try {
        await pRetry(() => pTimeout(page.close(), 5000))
      } catch (e) {
        logException(e, `Unable to close page: ${e}`)
      }
    })
  }
}

export default TaskWebSeries
