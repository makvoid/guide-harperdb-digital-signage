'use strict'

// Import helpers
const {
  validateBasicAuth,
  chainValidators,
  checkBody,
  validateUUID
} = require('../helpers')

module.exports = async (server, { hdbCore, logger }) => {
  /** Get all devices */
  server.route({
    url: '/signs/device',
    method: 'GET',
    preValidation: (request) => validateBasicAuth(request, logger),
    handler: (request) => {
      // Return all devices configured
      request.body = {
        operation: 'sql',
        sql: 'SELECT * FROM signs.devices'
      }

      return hdbCore.requestWithoutAuthentication(request)
    }
  })

  /* Get a singular device */
  server.route({
    url: '/signs/device/:deviceId',
    method: 'GET',
    preValidation: (request) => validateBasicAuth(request, logger),
    handler: async (request) => {
      // Get the device ID and validate
      const deviceId = request.params.deviceId
      if (!validateUUID(deviceId)) {
        return { error: `Invalid UUID provided for deviceId: ${request.params.deviceId}` }
      }

      // Grab the device information
      request.body = {
        operation: 'sql',
        sql: `SELECT * FROM signs.devices WHERE id = '${deviceId}'`
      }
      const devices = await hdbCore.requestWithoutAuthentication(request)

      // Ensure at least one result was returned
      if (!devices.length) {
        return { message: `Invalid Device ID provided: ${deviceId}` }
      }

      return devices[0]
    }
  })

  /* Device creation */
  server.route({
    url: '/signs/device',
    method: 'POST',
    preValidation: (request) => chainValidators([
      validateBasicAuth(request, logger),
      checkBody(['name', 'sign'], request, logger)
    ]),
    handler: (request) => {
      request.body = {
        operation: 'insert',
        schema: 'signs',
        table: 'devices',
        records: [
          request.body
        ]
      }

      return hdbCore.requestWithoutAuthentication(request)
    }
  })

  /* Device Updating */
  server.route({
    url: '/signs/device/:deviceId',
    method: 'POST',
    preValidation: (request) => chainValidators([
      validateBasicAuth(request, logger),
      checkBody(['name', 'sign'], request, logger)
    ]),
    handler: async (request) => {
      // Get the device ID and validate
      const deviceId = request.params.deviceId
      if (!validateUUID(deviceId)) {
        return { error: `Invalid UUID provided for deviceId: ${request.params.deviceId}` }
      }

      // Add the ID (as required by update) and add in our Device object from the request body
      const record = { id: deviceId, ...request.body }
      request.body = {
        operation: 'update',
        schema: 'signs',
        table: 'devices',
        records: [record]
      }

      return hdbCore.requestWithoutAuthentication(request)
    }
  })

  /** Device Removal */
  server.route({
    url: '/signs/device/:deviceId',
    method: 'DELETE',
    preValidation: (request) => validateBasicAuth(request, logger),
    handler: async (request) => {
      // Get the device ID and validate
      const deviceId = request.params.deviceId
      if (!validateUUID(deviceId)) {
        return { error: `Invalid UUID provided for deviceId: ${request.params.deviceId}` }
      }

      // Craft removal request
      request.body = {
        operation: 'delete',
        schema: 'signs',
        table: 'devices',
        hash_values: [deviceId]
      }

      return hdbCore.requestWithoutAuthentication(request)
    }
  })
}
