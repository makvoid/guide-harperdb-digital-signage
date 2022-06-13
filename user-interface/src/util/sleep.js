/**
 * Sleep the thread for a certain amount of time
 *
 * @param {number} ms number of milliseconds to wait for
 * @returns {Promise<void>}
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export default sleep
