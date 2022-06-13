'use strict'

module.exports = async (server, { hdbCore, logger }) => {
  // Simple passthrough to the underlying HarperDB API
  server.route({
    url: '/passthrough',
    method: 'POST',
    preValidation: hdbCore.preValidation,
    handler: hdbCore.request
  })
}
