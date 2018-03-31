const {
  validateOptions,
  isProduction,
  validatePayload,
  format,
  request
} = require('./util')

class GAS {
  constructor (options) {
    validateOptions(options)

    this.options = Object.assign({
      prefix: false,
      hash: true,
      isServerOnProduction: false
    }, options)
  }

  async send (payload) {
    if (!isProduction(this.options)) {
      return null
    }

    const multi = Array.isArray(payload)

    if (multi && !payload.length) {
      return console.warn('Empty array is not valid!')
    }

    validatePayload(payload)

    if (multi) {
      return request(
        this.options.apiUrl,
        { events: payload.map(event => format(event, this.options)) },
        multi
      )
    }

    return request(
      this.options.apiUrl,
      format(payload, this.options)
    )
  }
}

module.exports = GAS
