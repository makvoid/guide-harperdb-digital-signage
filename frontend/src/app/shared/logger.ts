/**
 * Builds a string representation of a log message
 *
 * @param level string error level to assign to the message
 * @param msg string message to log with the message
 * @returns string of formatted message
 */
const buildMessage = (level: string, msg: string) => {
  const localeString = new Date().toLocaleString()
  return `[${localeString}][${level}] ${msg}`
}

/**
 * Log an exception and it's message
 *
 * @param exception Error error object
 * @param msg any[] Log message to pass
 */
const error = (exception: unknown | Error, ...msg: any[]) => {
  console.error(buildMessage('error', msg.join(' ')))
  console.trace(exception)
}

/**
 * Trace an object and log a message
 * @param target any object to trace
 * @param msg any[] Log message to pass
 */
const trace = (target: any, ...msg: any[]) => {
  console.log(buildMessage('debug', msg.join(' ')))
  console.trace(target)
}

/**
 * Log a message to the DevTools
 *
 * @param msg Log message to pass
 */
const log = (...msg: any[]) => {
  console.log(buildMessage('info', msg.join(' ')))
}

export default {
  error, trace, log
}
