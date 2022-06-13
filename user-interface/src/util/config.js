import { promises as fs } from 'fs'

import { fileExists } from './file.js'
import { CONFIG_PATH } from './constants.js'

/**
 * Loads and parses the application configuration and returns it as an object
 *
 * @returns {object} configuration object
 */
export const loadConfiguration = async () => {
  if (!await fileExists(CONFIG_PATH)) {
    throw new Error('Configuration file does not exist')
  }
  let contents
  try {
    contents = await fs.readFile(CONFIG_PATH, 'utf-8')
  } catch (e) {
    throw new Error('Unable to read configuration file (bad permissions?)')
  }
  let config
  try {
    config = JSON.parse(contents)
  } catch (e) {
    throw new Error('Unable to parse configuration file (invalid JSON?)')
  }
  return config
}
