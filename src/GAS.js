const {
  validateOptions,
  checkIsProduction,
  validatePayload,
  request
} = require('./util')

class GAS {
  constructor (options) {
    validateOptions(options)

    this.options = Object.assign({
      prefix: false,
      hash: true,
      isServerOnProduction: false,
      logging: false
    }, options)
  }

  async send (payload) {
    if (!this.options.logging && !checkIsProduction(this.options)) {
      return null
    }

    const multi = Array.isArray(payload)

    if (multi && !payload.length) {
      return console.warn('Empty array is not valid!')
    }

    validatePayload(payload)

    return request(payload, this.options, multi)
  }
}

module.exports = GAS
