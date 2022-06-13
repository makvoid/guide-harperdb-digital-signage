'use strict'

/**
 * Check if a value is a valid UUIDv4 string or not
 *
 * @param value: string value to validate
 * @returns boolean
 */
const validateUUID = (value) => {
  // UUIDv4 regex validation pattern
  const regex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi
  return regex.test(value)
}

module.exports = validateUUID
