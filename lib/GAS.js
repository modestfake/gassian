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

    this.options = {
      product: 'jira',
      prefix: false,
      hash: true,
      fetch: typeof window !== 'undefined' ? window.fetch : null,
      detectProd: /* istanbul ignore next */ () => false,
      ...options
    }
  }

  async send (params) {
    const { options } = this

    if (!isProduction(options)) {
      return null
    }

    const multi = Array.isArray(params)

    if (!validatePayload(params)) {
      throw new Error('Not all required fields are passed to an event object!')
    }

    if (multi) {
      return request(
        options.fetch,
        options.apiUrl,
        { events: params.map(event => format(options, event)) },
        multi
      )
    }

    return request(
      options.fetch,
      options.apiUrl,
      format(options, params),
      multi
    )
  }
}

module.exports = GAS
