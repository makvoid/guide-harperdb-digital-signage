'use strict'

/**
 * Ensure the Basic Authentication parameters passed belong to a valid role
 *
 * @param request: Request request object
 * @param hdbCore: HDB Core object
 * @param logger: Logger HDB Logger
 * @throws Error if the authorization token is not found, or if the authorization is invalid
 * @returns Request request object
 */
const validateBasicAuth = async (request, hdbCore, logger) => {
  // Grab authorization token from headers
  let token = request.headers?.authorization ? request.headers?.authorization : null

  // Ensure the Authorization header was set
  if (!token) {
    const errorString = 'No Authorization token header found.'
    logger.error(errorString)
    throw new Error(errorString)
  }

  // Set up the passthrough request
  request.body = {
    operation: 'user_info'
  }

  // Send a request to HarperDB to validate the authentication token supplied
  token = token.split(' ')[1]
  try {
    await hdbCore.requestWithoutAuthentication(request)
  } catch (_e) {
    const errorString = 'Invalid Authorization provided.'
    logger.error(errorString)
    throw new Error(errorString)
  }

  return request
}

module.exports = validateBasicAuth
