'use strict'

const chainValidators = require('./chainValidators')
const checkBody = require('./checkBody')
const postData = require('./postData')
const validateBasicAuth = require('./validateBasicAuth')
const validateUUID = require('./validateUUID')

module.exports = {
  chainValidators,
  checkBody,
  postData,
  validateBasicAuth,
  validateUUID
}
