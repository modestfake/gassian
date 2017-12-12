const fetch = require('isomorphic-fetch')
const API_URL = 'https://mgas.prod.public.atl-paas.net/v1'

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

async function request (payload, multi) {
  return fetch(`${API_URL}/event${multi ? 's' : ''}`, {
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
    body: JSON.stringify(payload)
  })
  .then(parseJSON)
  .catch(error => {
    throw error
  })
}

function parseJSON (response) {
  if (response.status >= 200 && response.status < 300) {
    const contentType = response.headers.get('content-type')

    if (contentType && contentType.includes('application/json')) {
      return response.json()
    }
  }

  const error = new Error(response.statusText)
  error.response = response
  throw error
}

module.exports = {
  isProduction,
  request
}
