const hash = require('object-hash')
const { isProduction, request } = require('./utils')

class GAS {
  constructor ({
    product = 'jira',
    subproduct,
    prodDomain,
    version = '',
    prefix = false,
    detectProd
  }) {
    if (typeof subproduct === 'undefined' || typeof prodDomain === 'undefined') {
      throw new Error('subproduct and prodDomain are required!')
    }

    this.product = product
    this.subproduct = subproduct
    this.prodDomain = prodDomain
    this.version = version
    this.prefix = prefix
    this.detectProd = detectProd
  }

  async send (params) {
    if (!isProduction({ prodDomain: this.prodDomain, detectProd })) {
      return
    }

    const multi = Array.isArray(params)

    if (!this.validate(params)) {
      throw new Error('Not all required fields passed to an event object!')
    }

    if (multi) {
      return request(
        { events: params.map(event => this.format(event)) },
        multi
      )
    }

    return request(this.format(params), multi)
  }

  validate (params) {
    const requiredFields = [
      'user',
      'cloudId',
      'name'
    ]

    const checkRequired = fields => requiredFields
    .every(field => Object.keys(fields).includes(field) && fields[field].length)

    if (Array.isArray(params)) {
      return params.every(events => {
        return checkRequired(events)
      })
    }

    return checkRequired(params)
  }

  format (event) {
    const eventParts = [event.page, event.name]

    if (this.prefix) {
      eventParts.unshift(this.subproduct)
    }

    const eventName = eventParts.filter(e => e).join('.')

    return {
      name: eventName,
      server: this.prodDomain,
      product: this.product,
      subproduct: this.subproduct,
      version: this.version,
      user: hash(event.user),
      cloud_id: hash(event.cloudId),
      serverTime: Date.now()
    }
  }
}

module.exports = GAS
