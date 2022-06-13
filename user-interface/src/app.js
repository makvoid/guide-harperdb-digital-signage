import DigitalSignage from './util/digital-signage.js'

/**
 * Runs the application
 */
const run = async () => {
  const sign = new DigitalSignage()
  sign.start()

  // Later, if needed:
  // await sign.close()
}
run()
