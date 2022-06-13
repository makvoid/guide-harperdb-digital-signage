import pRetry from 'p-retry'
import pTimeout from 'p-timeout'

import Task from './task.js'
import { logException, panic } from '../util/logging.js'

class TaskGoogleSlides extends Task {
  page = null
  slideCount = 0
  activeSlide = 1
  direction = 'up'
  slideshowSelector = '#punch-start-presentation-left'

  /**
   * Initialize the task
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
   * Handle updating the task (changing URLs, settings, etc)
   */
  async update () {
    // Load the page
    try {
      await pRetry(() => pTimeout(
        this.page.goto(this.browser.parent.task.metadata.url),
        15000
      ))
    } catch (e) {
      panic(e, 'Unable to navigate')
    }

    // Determine how many slides there are
    try {
      this.slideCount = (await this.page.$$('g.punch-filmstrip-thumbnail')).length
    } catch (e) {
      logException(e, `Unable to determine slide count: ${e}`)
    }

    // Wait for the movie player to appear
    try {
      await this.page.waitForSelector(this.slideshowSelector)
    } catch (e) {
      logException(e, `Unable to wait for presentation selector to appear: ${e}`)
    }

    // Play the movie player
    try {
      await this.page.click(this.slideshowSelector)
    } catch (e) {
      logException(e, `Unable to click play button: ${e}`)
    }

    // Move the mouse to a corner
    try {
      await this.page.mouse.move(0, 0)
    } catch (e) {
      logException(e, `Unable to move the mouse: ${e}`)
    }

    // Setup a timer to switch between slides
    this.timer = setInterval(() =>
      this.changeSlide(), this.browser.parent.task.metadata.slideTimer * 1000
    )
  }

  /**
   * Handles changing the slides depending on the loop type mode
   *
   * @returns {Promise<void>}
   */
  async changeSlide () {
    // Call the appropriate method for the configured loop type
    const loopType = this.browser.parent.task.metadata.loopType
    switch (loopType) {
      case 'loop':
        return this.changeSlideLoop()
      case 'reset':
        return this.changeSlideReset()
      default:
        logException(new Error(`Unknown loop type: ${loopType}`), 'Unable to change slide')
    }
  }

  /**
   * 'Loop' loop type slide changing logic
   */
  async changeSlideLoop () {
    // Handle changing slide direction when we reach a limit
    if (this.activeSlide === this.slideCount) {
      this.direction = 'down'
    } else if (this.activeSlide === 1) {
      this.direction = 'up'
    }

    // Keep track of which slide we are on
    this.activeSlide = this.direction === 'up' ? this.activeSlide + 1 : this.activeSlide - 1

    // Switch to the next slide
    const key = this.direction === 'up' ? 'ArrowRight' : 'ArrowLeft'
    try {
      await this.page.keyboard.press(key)
    } catch (e) {
      logException(e, 'Unable to change slide')
    }
  }

  /**
   * 'Reset' loop type changing logic
   *
   * @returns {Promise<void>}
   */
  async changeSlideReset () {
    // Handle resetting the loop as needed
    if (this.activeSlide === this.slideCount) {
      try {
        await this.page.keyboard.press('Home')
      } catch (e) {
        logException(e, 'Unable to return to first slide')
      }
      this.activeSlide = 1
    } else {
      this.activeSlide++
    }

    // Don't change pages if we are the home position
    if (this.activeSlide === 1) {
      return
    }

    // Switch to the next slide
    try {
      await this.page.keyboard.press('ArrowRight')
    } catch (e) {
      logException(e, 'Unable to change slide')
    }
  }

  /**
   * Clean up logic (remove tab, timers)
   */
  async cleanUp () {
    // Remove the timer
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

export default TaskGoogleSlides
