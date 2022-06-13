const async = require('async')
const { randomUUID } = require('crypto')
const execa = require('execa')
const fs = require('fs-extra')
const glob = require('glob')
const fetch = require('node-fetch')
const path = require('path')
const tar = require('tar-stream')
const util = require('util')
const globPromise = util.promisify(glob.glob)
const pack = tar.pack()

// Required configuration
const HDB_INSTANCE_NAME = 'signs'
const HDB_ACCOUNT = 'makvoid'
const HDB_USERNAME = 'signs_user'
const HDB_PASSWORD = ''
const HDB_PROJECT_NAME = 'api'

// Defaults
const HDB_API_URL = `https://${HDB_INSTANCE_NAME}-${HDB_ACCOUNT}.harperdbcloud.com`
const HDB_CF_API_URL = `https://functions-${HDB_INSTANCE_NAME}-${HDB_ACCOUNT}.harperdbcloud.com`
const ENCODED_CREDENTIALS = Buffer.from(`${HDB_USERNAME}:${HDB_PASSWORD}`).toString('base64')
const HDB_CUSTOM_FUNCTION_DIRECTORY = path.resolve(__dirname, '../custom-functions')
const FRONTEND_BUILD_PATH = path.resolve(__dirname, '../frontend/dist/frontend')

// Change working directory
process.chdir(HDB_CUSTOM_FUNCTION_DIRECTORY)

/**
 * Checks if a file exists
 *
 * @param {string} path file path to check
 * @returns boolean
 */
const fileExists = async (path) => {
  try {
    await fs.promises.access(path, fs.constants.F_OK)
  } catch (_e) {
    return false
  }
  return true
}

const main = async () => {
  // Ensure the Frontend has been built and is available to copy
  if (!await fileExists(FRONTEND_BUILD_PATH)) {
    console.error('Frontend build is missing. Will attempt to build before packaging - please wait.')

    // Change to the frontend's directory and build the application
    process.chdir(path.resolve(__dirname, '../frontend'))
    try {
      const promise = execa('npx', [
        'ng',
        'build',
        '--base-href',
        `${HDB_CF_API_URL}/api/static/`
      ])

      // Pipe process output to this process
      promise.stdout.pipe(process.stdout)
      promise.stderr.pipe(process.stderr)

      // Wait for build to finish/error
      await Promise.all([promise])
    } catch (e) {
      console.error(e)
      process.exit(1)
    }

    // Change back to the Custom Functions directory
    process.chdir(HDB_CUSTOM_FUNCTION_DIRECTORY)

    // Ensure the build succeeded
    if (!await fileExists(FRONTEND_BUILD_PATH)) {
      console.error('Frontend could not be built automatically. Please review for any errors and resolve them before continuing.')
      process.exit(1)
    }
  }

  // Copy the frontend to the Custom Functions directory
  await fs.copy(FRONTEND_BUILD_PATH, path.resolve('./static'), { overwrite: true })

  // Find all files (no directories) within the Custom Functions directory
  const files = await globPromise('**/*.*', { nodir: true })
  console.log('Found a total of', files.length, 'files to add to the archive.')

  // Iterate through each file and add it to the archive
  await async.each(files, async (name) => {
    // Read the file contents
    let fileContents
    try {
      fileContents = await fs.promises.readFile(name, 'utf-8')
    } catch (e) {
      console.error(e)
      process.exit(1)
    }
    pack.entry({ name }, fileContents)
  })

  // Craft the deployment request
  const operation = {
    operation: 'deploy_custom_function_project',
    project: HDB_PROJECT_NAME,
    file: `/tmp/${randomUUID()}.tar`,
    payload: pack.read().toString('base64')
  }

  // Attempt to upload the package
  let result
  try {
    console.log('Deploying the project to HarperDB, please wait...')
    const request = await fetch(HDB_API_URL, {
      method: 'POST',
      body: JSON.stringify(operation),
      headers: {
        Authorization: `Basic ${ENCODED_CREDENTIALS}`,
        'Content-Type': 'application/json'
      }
    })
    result = await request.json()
  } catch (e) {
    console.error(e)
    return
  }

  // Display results of operation
  console.log('Deployment has finished -', result.error ? result.error : result.message)
  process.exit(result.error ? 1 : 0)
}
main()
