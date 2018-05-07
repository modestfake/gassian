// @flow

const {
  validateOptions,
  checkIsProduction,
  validatePayload,
  request
} = require('./util')

type Options = {
  apiUrl: string,
  product: string,
  subproduct?: string,
  domain: string,
  version?: string,
  prefix?: boolean,
  hash?: boolean,
  isServerOnProduction?: boolean,
  logging?: boolean
}

type Payload = {
  name: string,
  page?: string,
  user: string | number,
  cloudId: string | number,
  properties?: mixed,
  hash?: mixed
}

class GAS<Options> {
  options: Options

  constructor (options: Options) {
    validateOptions(options)

    this.options = Object.assign({
      prefix: false,
      hash: true,
      isServerOnProduction: false,
      logging: false
    }, options)
  }

  async send (payload: Payload | Array<Payload>) {
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
