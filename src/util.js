const md5 = require('md5')
require('cross-fetch/polyfill')

function validateOptions (options) {
  const requiredFields = [
    'apiUrl',
    'product',
    'domain'
  ]

  const errors = requiredFields.filter(f => !(f in options))

  if (errors.length) {
    throw new Error(`The following fields are required: ${errors.join(', ')}`)
  }

  if (!options.apiUrl.includes('v1')) {
    throw new Error(`API URL is probably wrong or you've forgotten to add '/v1' to apiUrl`)
  }
}

function _getEnvironment () {
  return typeof window === 'undefined'
    ? 'node'
    : 'browser'
}

function isProduction ({ domain, isServerOnProduction }) {
  const env = _getEnvironment()

  if (env === 'browser') {
    return window.location.href.includes(domain)
  }

  return isServerOnProduction
}

function validatePayload (payload) {
  const requiredFields = [
    'user',
    'cloudId',
    'name'
  ]

  const validateEvent = event => requiredFields
  .filter(field => !(
    Object.keys(event).includes(field) &&
    event[field]
  ))

  if (Array.isArray(payload)) {
    const invalidEventList = payload.reduce((acc, event, index) => {
      const fieldList = validateEvent(event)
      if (!fieldList.length) return acc

      return [
        ...acc,
        `${event.name || `event index ${index}`} (${fieldList.join(', ')})`
      ]
    }, [])

    if (invalidEventList.length) {
      throw new Error([
        'Please pass required fields for these events:',
        `${invalidEventList.join(', ')}!`
      ].join(' '))
    }
  } else {
    const fieldList = validateEvent(payload)
    if (fieldList.length) {
      throw new Error(`Please pass required fields: ${fieldList.join(', ')}!`)
    }
  }
}

function _hash (event, globalHash) {
  const { hash, cloudId, user } = event

  const shouldHash = hash !== undefined && typeof hash !== 'object'
    ? hash
    : globalHash

  const hashConfig = {
    cloudId: shouldHash,
    user: shouldHash
  }

  if (typeof hash === 'object') {
    Object.keys(hash).forEach(field => {
      hashConfig[field] = hash[field]
    })
  }

  return {
    cloudId: hashConfig.cloudId ? md5(cloudId) : cloudId.toString(),
    user: hashConfig.user ? md5(user) : user.toString()
  }
}

function format (event, options) {
  const { domain, product, subproduct, version, prefix } = options
  const eventParts = [event.page, event.name]

  if (prefix) {
    eventParts.unshift(subproduct)
  }

  const eventName = eventParts.filter(Boolean).join('.')

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

async function request (apiUrl, payload, multi = false) {
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
    throw Object.assign(
      new Error(response.statusText),
      { response }
    )
  }
}

module.exports = {
  validateOptions,
  isProduction,
  validatePayload,
  format,
  request
}
