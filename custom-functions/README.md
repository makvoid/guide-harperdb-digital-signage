# Custom Functions

## Introduction
Custom Functions is a feature provided by HarperDB that allows you to host your own API routes on the same Instance as HarperDB, by extending the underlying Fastify API.

## Deployment
To deploy the Custom Functions package, I've prepared a script within the `scripts` folder in the root of the repository.

---

## Routes

### Dashboard
* `GET /signs/dashboard`: Returns the online device count, total number of devices, number of recent exceptions within the past hour and a list of all exceptions that have not been removed.

### Device
* `GET /signs/device`: Returns all active Devices that are set up
* `GET /signs/device/:deviceId`: Returns a single Device and it's metadata
* `POST /signs/device`: Creates a new Device
* `POST /signs/device/:deviceId`: Updates an existing Device
* `DELETE /signs/device/deviceId`: Removes a Device

### Log
* `GET /signs/heartbeat/:deviceId`: Registers a Device heartbeat (so we know it's online)
* `POST /signs/log`: Creates a new log alert for an exception
* `DELETE /signs/log/:logId`: Dismisses an alert by it's logId

### Misc
* `POST /passthrough`: Allows a request to be routed to the HarperDB API versus the Custom Functions
---
## Helpers

### chainValidators
Allows the User to chain multiple validators, such as `checkBody` and `validateBasicAuth`

### checkBody
Checks the request body for certain fields and errors if they are not present

### postData
Submits a POST request to a remote endpoint with a body value

### validateBasicAuth
Takes the authentication information supplied by the User and checks it against the underlying HarperDB instance to ensure it is valid

### validateUUID
Checks a value against the UUIDv4 format
