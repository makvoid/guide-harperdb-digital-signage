import pRetry from 'p-retry'
import pTimeout from 'p-timeout'

import Task from './task.js'
import { logException, panic } from '../util/logging.js'

class TaskYouTube extends Task {
  page = null
  playButtonSelector = '#movie_player > div.ytp-cued-thumbnail-overlay'
  fullscreenSelector = '#movie_player > div.ytp-chrome-bottom > div.ytp-chrome-controls > div.ytp-right-controls > button.ytp-fullscreen-button.ytp-button'

  /**
   * Create the page required
   */
  async initialize () {
    // Create the new page
    try {
      this.page = await pRetry(() => pTimeout(this.browser.puppet.newPage(), 5000))
    } catch (e) {
      panic(e, 'Unable to create new page')
    }
  }

  /**
   * Handle updating the task, full-screening and playing the video
   */
  async update () {
    // Load the page
    try {
      await pRetry(() => pTimeout(
        this.page.goto(`https://www.youtube.com/embed/${this.browser.parent.task.metadata.videoId}`),
        15000
      ))
    } catch (e) {
      panic(e, 'Unable to navigate')
    }

    // Wait for the movie player to appear
    try {
      await this.page.waitForSelector(this.playButtonSelector)
    } catch (e) {
      logException(e, `Unable to wait for movie selector to appear: ${e}`)
    }

    // Play the movie player
    try {
      await this.page.click(this.playButtonSelector)
    } catch (e) {
      logException(e, `Unable to click play button: ${e}`)
    }

    // Fullscreen the movie player
    try {
      await this.page.click(this.fullscreenSelector)
    } catch (e) {
      logException(e, `Unable to click fullscreen button: ${e}`)
    }

    // Move the mouse to a corner
    // (sometimes the button title would stay visible in GNOME)
    try {
      await this.page.mouse.move(0, 0)
    } catch (e) {
      logException(e, `Unable to move the mouse: ${e}`)
    }
  }

  /**
   * Handle the clean up, remove the page setup
   */
  async cleanUp () {
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

export default TaskYouTube
