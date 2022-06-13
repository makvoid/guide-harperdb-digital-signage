'use strict'

const https = require('https')

/**
 * Send a POST request to a remote endpoint
 *
 * @param url: string URL to send request to
 * @param data: object data to send in the request
 * @param token: string Base64 encoded basic authentication string
 * @returns Promise<object> json response from endpoint
 */
const postData = async (url, data, token) => {
  const dataString = JSON.stringify(data)

  // Request parameters
  const options = {
    method: 'POST',
    headers: {
      Authorization: `Basic ${token}`,
      'Content-Type': 'application/json',
      'Content-Length': dataString.length
    },
    timeout: 1000 // in ms
  }

  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      if (res.statusCode < 200 || res.statusCode > 299) {
        return reject(new Error(`HTTP status code ${res.statusCode}`))
      }

      const body = []
      res.on('data', (chunk) => body.push(chunk))
      res.on('end', () => {
        const resString = Buffer.concat(body).toString()
        resolve(resString)
      })
    })

    req.on('error', (err) => {
      reject(err)
    })

    req.on('timeout', () => {
      req.destroy()
      reject(new Error('Request time out'))
    })

    req.write(dataString)
    req.end()
  })
}

module.exports = postData
