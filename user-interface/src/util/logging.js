import fetch from 'node-fetch'
import winston from 'winston'
import { loadConfiguration } from './config.js'

export const logger = winston.createLogger({
  level: 'info',
  transports: [
    new winston.transports.Console({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    })
  ]
})

/**
 * Submit a log statement to the DB for viewing
 *
 * @param {Error} exception error object to log
 * @param {string} description log message to associate with the exception
 * @returns {Promise<void>}
 */
export const submitLog = async (exception, description) => {
  // Load configuration
  let config
  try {
    config = await loadConfiguration()
  } catch (e) {
    logException(e, 'Unable to load configuration')
    return
  }

  // Submit request
  try {
    await fetch(`${config.apiUrl}signs/log`, {
      method: 'POST',
      body: JSON.stringify({ id: config.id, exception, description: description.join(' ') }),
      headers: { 'Content-Type': 'application/json', Authorization: `Basic ${config.authToken}` }
    })
  } catch (e) {
    throw new Error(`Unable to upload log: ${e}`)
  }
}

/**
 * Log an exception and then exit application execution
 *
 * @param {Error} exception error object to log
 * @param  {string[]} description log message to associate exception with
 */
export const panic = async (exception, ...description) => {
  logException(exception, description)

  // Upload log to HarperDB
  try {
    await submitLog(exception, description)
  } catch (e) {
    logException(e, 'Unable to upload log')
  }

  process.exit(1)
}

/**
 * Log an exception
 *
 * @param {Error} exception error object to log
 * @param  {...any} description log message to associate exception with
 * @returns {winston.Logger} logger instance
 */
export const logException = (exception, ...description) => {
  const exceptionMsg = exception?.message ? exception.message : 'None'
  const errorString = description.length ? `${description.join(' ')}: ${exceptionMsg}` : exceptionMsg
  return logger.error(errorString, { exception: getErrorStack(exception) })
}

/**
 * Parses an exception and grabs the error or stack depending on the type
 *
 * @param {Error} exception error object to parse
 * @returns {any} error stack
 */
export const getErrorStack = (exception) => {
  let stack = null
  if (exception.error) {
    stack = exception.error
  } else if (exception.stack) {
    stack = exception.stack
  }
  return stack
}
