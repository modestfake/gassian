const {
  validateRequiredFields,
  isProduction,
  validatePayload,
  format,
  request
} = require('./utils')

class GAS {
  constructor (options) {
    validateRequiredFields(options)

    this.options = Object.assign({
      prefix: false,
      hash: true,
      isServerOnProduction: false
    }, options)
  }

  async send (params) {
    const { options } = this

    if (!isProduction(options)) {
      return null
    }

    const multi = Array.isArray(params)

    if (multi && !params.length) {
      console.warn('Empty array is not valid!')
      return null
    }

    validatePayload(params)

    if (multi) {
      return request(
        options.apiUrl,
        { events: params.map(event => format(options, event)) },
        multi
      )
    }

    return request(
      options.apiUrl,
      format(options, params)
    )
  }
}

module.exports = GAS
