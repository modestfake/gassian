const fetch = require('node-fetch')
const nock = require('nock')
const GAS = require('../lib')

const defaultOptions = {
  apiUrl: 'https://example.com/v1',
  subproduct: 'addon-template',
  prodDomain: 'prod.domain.com'
}

beforeAll(() => {
  global.fetch = fetch
})

describe('GAS on client', () => {
  test('Pass not all required parameters', () => {
    try {
      const gas = new GAS({
        apiUrl: 'https://example.com/v1'
      })
    } catch (error) {
      expect(error.message).toBe('The following fields are required: subproduct, prodDomain')
    }
  })

  test('Pass all required parameters', async () => {
    const gas = new GAS({ ...defaultOptions })

    const { apiUrl, product, subproduct, prodDomain, prefix, fetch } = gas.options

    expect(apiUrl).toBe('https://example.com/v1')
    expect(product).toBe('jira')
    expect(subproduct).toBe('addon-template')
    expect(prodDomain).toBe('prod.domain.com')
    expect(prefix).toBe(false)
  })

  test('Send event on dev environment', async () => {
    const gas = new GAS({ ...defaultOptions })

    const response = await gas.send({})
    expect(response).toEqual(null)
  })

  test('Send event on prod environment with not all required fields', async () => {
    jsdom.reconfigure({
      url: 'https://prod.domain.com/'
    })

    const gas = new GAS({
      apiUrl: 'https://example.com/v1',
      subproduct: 'addon-template',
      prodDomain: 'prod.domain.com'
    })

    try {
      await gas.send({})
    } catch (error) {
      expect(error.message).toBe('Not all required fields passed to an event object!')
    }
  })

  test('Send one event on prod environment', async () => {
    jsdom.reconfigure({
      url: 'https://prod.domain.com/'
    })

    const gas = new GAS({
      ...defaultOptions,
      prefix: true
    })

    await nock('https://example.com/v1/')
    .post('/event')
    .reply(200, { responseMessage: 'Processed 1 event' })

    const response = await gas.send({
      name: 'account.visited',
      page: 'project-config',
      user: 'user-123',
      cloudId: 'https://test-cloud.atlassian.net'
    })

    expect(response.responseMessage).toBe('Processed 1 event')
  })
})
