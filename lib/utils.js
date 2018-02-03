const objectHash = require('object-hash')

function validateRequiredFields (fields) {
  const required = [
    'apiUrl',
    'product',
    'domain'
  ]

  if (typeof window === 'undefined') {
    required.push('fetch')
  }

  const errors = required.filter(f => !fields[f])

  if (errors.length) {
    throw new Error(`The following fields are required: ${errors.join(', ')}`)
  }

  if (!fields.apiUrl.includes('v1')) {
    throw new Error(`API URL is probably wrong or you've forgotten to add '/v1' to apiUrl`)
  }
}

function getEnvironment () {
  return typeof window === 'undefined'
    ? 'node'
    : 'browser'
}

function isProduction ({ domain, isServerOnProduction }) {
  const env = getEnvironment()

  if (env === 'browser') {
    return window.location.href.includes(domain)
  }

  return isServerOnProduction
}

function validatePayload (params) {
  const requiredFields = [
    'user',
    'cloudId',
    'name'
  ]

  const checkRequired = fields => requiredFields.some(field => {
    return Object.keys(fields).includes(field) && fields[field].length
  })

  if (Array.isArray(params)) {
    return params.every(events => checkRequired(events))
  }

  return checkRequired(params)
}

function _hash (event, globalHash) {
  const { hash, cloudId, user } = event

  const shouldHash = hash !== undefined && typeof hash !== 'object'
    ? hash
    : globalHash

  const hashObject = {
    cloudId: shouldHash,
    user: shouldHash
  }

  if (typeof hash === 'object') {
    Object.keys(hash).forEach(field => {
      hashObject[field] = hash[field]
    })
  }

  return {
    cloudId: hashObject.cloudId ? objectHash(cloudId) : cloudId,
    user: hashObject.user ? objectHash(user) : user
  }
}

function format (options, event) {
  const { domain, product, subproduct, version, prefix } = options
  const eventParts = [event.page, event.name]

  if (prefix) {
    eventParts.unshift(subproduct)
  }

  const eventName = eventParts.filter(e => e).join('.')

  const { user, cloudId } = _hash(event, options.hash)

  const payload = {
    name: eventName,
    server: domain,
    product,
    subproduct,
    version,
    user,
    cloud_id: cloudId,
    properties: event.properties,
    serverTime: Date.now()
  }

  Object.keys(payload).forEach(key => {
    if (!payload[key]) {
      delete payload[key]
    }
  })

  return payload
}

async function request (fetch, apiUrl, payload, multi = false) {
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
  if (response.ok) {
    const contentType = response.headers.get('content-type')

    /* istanbul ignore next */
    if (contentType && contentType.includes('application/json')) {
      return response.json()
    }

    /* istanbul ignore next */
    throw new Error('Response should be in JSON format')
  } else {
    const error = new Error(response.statusText)
    error.response = response

    throw error
  }
}

module.exports = {
  validateRequiredFields,
  isProduction,
  validatePayload,
  format,
  request
}
