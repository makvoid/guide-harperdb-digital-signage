'use strict'

// Import helpers
const {
  chainValidators,
  validateBasicAuth,
  validateUUID,
  checkBody
} = require('../helpers')

module.exports = async (server, { hdbCore, logger }) => {
  /** Log Removal */
  server.route({
    url: '/signs/log/:logId',
    method: 'DELETE',
    preValidation: (request) => validateBasicAuth(request, hdbCore, logger),
    handler: (request) => {
      // Validate UUID provided
      if (!validateUUID(request.params.logId)) {
        return { error: `Invalid UUID provided for logId: ${request.params.logId}` }
      }

      // Delete row from database
      request.body = {
        operation: 'delete',
        table: 'logs',
        schema: 'signs',
        hash_values: [request.params.logId]
      }

      return hdbCore.requestWithoutAuthentication(request)
    }
  })

  /** Create a heartbeat */
  server.route({
    url: '/signs/heartbeat/:deviceId',
    method: 'GET',
    preValidation: (request) => validateBasicAuth(request, hdbCore, logger),
    handler: (request) => {
      // Validate UUID provided
      if (!validateUUID(request.params.deviceId)) {
        return { error: `Invalid UUID provided for deviceId: ${request.params.deviceId}` }
      }

      // Send heartbeat insert request
      request.body = {
        operation: 'insert',
        schema: 'signs',
        table: 'logs',
        records: [
          {
            deviceId: request.params.deviceId,
            message: 'Device heartbeat'
          }
        ]
      }

      return hdbCore.requestWithoutAuthentication(request)
    }
  })

  /** Create a new log */
  server.route({
    url: '/signs/log',
    method: 'POST',
    preValidation: (request) => chainValidators([
      validateBasicAuth(request, hdbCore, logger),
      checkBody(['id', 'exception', 'description'], request, logger)
    ]),
    handler: (request) => {
      // Validate Device UUID provided
      if (!validateUUID(request.body.id)) {
        return { error: `Invalid UUID provided for deviceId: ${request.body.id}` }
      }

      // Send insert request
      request.body = {
        operation: 'insert',
        schema: 'signs',
        table: 'logs',
        records: [
          {
            deviceId: request.body.id,
            exception: request.body.exception.code,
            message: request.body.description
          }
        ]
      }

      return hdbCore.requestWithoutAuthentication(request)
    }
  })
}
