'use strict'

// Import helper
const validateBasicAuth = require('../helpers/validateBasicAuth')

module.exports = async (server, { hdbCore, logger }) => {
  /** Dashboard fetch */
  server.route({
    url: '/signs/dashboard',
    method: 'GET',
    preValidation: (request) => validateBasicAuth(request, logger),
    handler: async (request) => {
      // Some of these values we only want values from the last hour
      const startTime = new Date().getTime() - 3600 * 1000

      // Get online device count
      request.body = {
        operation: 'sql',
        sql: 'SELECT deviceId, max(__createdtime__) AS latestRecord FROM signs.logs WHERE message = \'Device heartbeat\' GROUP BY deviceId'
      }
      const deviceLastHeartbeats = await hdbCore.requestWithoutAuthentication(request)
      const onlineDevices = deviceLastHeartbeats.filter(row => row.latestRecord > startTime)

      // Get total device count
      request.body = {
        operation: 'sql',
        sql: 'SELECT COUNT(*) AS num FROM signs.devices'
      }
      const [deviceCountRequest] = await hdbCore.requestWithoutAuthentication(request)
      const deviceCount = deviceCountRequest.num

      // Get number of recent exceptions
      request.body = {
        operation: 'sql',
        sql: `SELECT COUNT(*) AS num FROM signs.logs WHERE exception IS NOT NULL AND __createdtime__ > ${startTime}`
      }
      const [logCountRequest] = await hdbCore.requestWithoutAuthentication(request)
      const recentLogCount = logCountRequest.num

      // Get all non-dismissed exception logs
      request.body = {
        operation: 'sql',
        sql: 'SELECT logs.*, devices.name AS deviceName FROM signs.logs JOIN signs.devices ON logs.deviceId = devices.id WHERE logs.exception IS NOT NULL'
      }
      const logs = await hdbCore.requestWithoutAuthentication(request)

      return {
        widgets: {
          devices: {
            online: onlineDevices.length,
            total: deviceCount
          },
          recentAlerts: recentLogCount
        },
        logs
      }
    }
  })
}
