'use strict'

const postData = require('./postData')

/**
 * Ensure the Basic Authentication parameters passed belong to a valid role
 *
 * @param request: Request request object
 * @param logger: Logger HDB Logger
 * @throws Error if the authorization token is not found, or if the authorization is invalid
 * @returns Request request object
 */
const validateBasicAuth = async (request, logger) => {
  // Grab authorization token from headers
  let token = request.headers?.authorization ? request.headers?.authorization : null

  // Ensure the Authorization header was set
  if (!token) {
    const errorString = 'No Authorization token header found.'
    logger.error(errorString)
    throw new Error(errorString)
  }

  // Send a request to HarperDB to validate the authentication token supplied
  token = token.split(' ')[1]
  try {
    await postData('https://signs-makvoid.harperdbcloud.com', { operation: 'user_info' }, token)
  } catch (_e) {
    const errorString = 'Invalid Authorization provided.'
    logger.error(errorString)
    throw new Error(errorString)
  }

  return request
}

module.exports = validateBasicAuth
