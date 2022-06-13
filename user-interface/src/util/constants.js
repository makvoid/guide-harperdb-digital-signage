import os from 'os'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Path where the configuration is saved
 */
export const CONFIG_PATH = path.join(os.homedir(), '.sign_config.json')

/**
 * Path where the templates are stored
 */
export const TEMPLATES_PATH = path.resolve(__dirname, '../../assets/templates')

/**
 * Amount in seconds to wait for the browser to launch before exiting
 */
export const BROWSER_LAUNCH_TIMEOUT_SECONDS = 30
