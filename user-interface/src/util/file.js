import { promises as fs } from 'fs'

/**
 * Checks if a file exists
 *
 * @param {string} path file path to check
 * @returns {Promise<boolean>}
 */
export const fileExists = async (path) => {
  try {
    await fs.access(path, fs.F_OK)
  } catch (e) {
    return false
  }
  return true
}
