const hash = require('object-hash')

function validateRequiredFields (fields) {
  const required = [
    'subproduct',
    'prodDomain'
  ]

  if (typeof window === 'undefined') {
    required.push('fetch')
  }

  const errors = []

  required.some(field => {
    const exists = fields[field]

    if (!exists) {
      errors.push(field)
      return false
    }

    return true
  })

  if (errors.length) {
    throw new Error(`The following fields are required: ${errors.join(', ')}`)
  }
}

function assignOptions (options) {
  const defaults = {
    product: 'jira',
    prefix: false,
    fetch: typeof window !== 'undefined' ? window.fetch : null,
    detectProd: /* istanbul ignore next */ () =>  false
  }

  return Object.assign({}, defaults, options)
}

function getEnvirenment () {
  return typeof window === 'undefined'
    ? 'node'
    : 'browser'
}

function isProduction ({ prodDomain, detectProd }) {
  const env = getEnvirenment()

  if (env === 'browser') {
    return window.location.href.includes(prodDomain)
  }

  return detectProd()
}

function validatePayload (params) {
  const requiredFields = [
    'user',
    'cloudId',
    'name'
  ]

  const checkRequired = fields => requiredFields
  .some(field => Object.keys(fields).includes(field) && fields[field].length)

  if (Array.isArray(params)) {
    return params.every(events => checkRequired(events))
  }

  return checkRequired(params)
}

function format (options, event) {
  const { prodDomain, product, subproduct, version, prefix } = options
  const eventParts = [event.page, event.name]

  if (prefix) {
    eventParts.unshift(subproduct)
  }

  const eventName = eventParts.filter(e => e).join('.')

  return {
    name: eventName,
    server: prodDomain,
    product,
    subproduct,
    version,
    user: hash(event.user),
    cloud_id: hash(event.cloudId),
    serverTime: Date.now()
  }
}

async function request (fetch, apiUrl, payload, multi) {
  if (!fetch) {
    throw new Error('You are probably running this code on server-side.\nPlease provide fetch library in GAS constructor')
  }

  return fetch(`${apiUrl}/event${multi ? 's' : ''}`, {
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
    body: JSON.stringify(payload)
  })
  .then(parseJSON)
  .catch(error => {
    /* istanbul ignore next */
    throw error
  })
}

function parseJSON (response) {
  /* istanbul ignore else */
  if (response.status >= 200 && response.status < 300) {
    const contentType = response.headers.get('content-type')

    if (contentType && contentType.includes('application/json')) {
      return response.json()
    }
  } else {
    const error = new Error(response.statusText)
    error.response = response
    throw error
  }
}

module.exports = {
  validateRequiredFields,
  assignOptions,
  isProduction,
  validatePayload,
  format,
  request
}
