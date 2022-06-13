'use strict'

/**
 * Check the body of a request for certain values
 *
 * @param requiredFields: string[] array of fields to ensure are present
 * @param request: Request request object
 * @param logger: Logger HDB Logger
 * @throws Error if a field is missing
 * @returns Request request object
 */
const checkBody = async (requiredFields, request, logger) => {
  let missingFields
  if (!request.body) {
    // If the body is missing, they are all missing
    missingFields = requiredFields
  } else {
    // Make a list of each field missing from the request's body
    missingFields = requiredFields.map(field => field in request.body ? null : field).filter(v => !!v)
  }

  // If any fields are missing, throw an error letting our User know
  if (missingFields.length) {
    const errorString = `Missing required field(s) for request: ${missingFields.join(', ')}`
    logger.error(errorString)
    throw new Error(errorString)
  }

  return request
}

module.exports = checkBody
