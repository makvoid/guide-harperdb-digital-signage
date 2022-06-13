'use strict'

/**
 * Chains multiple validators for one request
 *
 * @param validatorPromises: Promise[] Validators to chain for a request
 * @throws Error validator failure
 * @returns Request request object
 */
const chainValidators = async (validatorPromises) => {
  // Await for all of the validator promises to resolve.
  // If a validator finds a problem, it will throw
  // an error and reject the Promise.
  const results = await Promise.all(validatorPromises)

  // If all Validators passed, just return the first request object (as they will be identical)
  return results[0]
}

module.exports = chainValidators
