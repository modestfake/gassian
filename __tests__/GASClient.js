require('cross-fetch/polyfill')
const nock = require('nock')
const GAS = require('../src')

const defaultOptions = {
  apiUrl: 'https://example.com/v1',
  product: 'jira',
  subproduct: 'addon-template',
  domain: 'prod.domain.com'
}

describe('GAS on client', () => {
  test('Pass not all required parameters', () => {
    try {
      /* eslint no-new: "off" */
      new GAS({
        apiUrl: 'https://example.com/v1'
      })
    } catch (error) {
      expect(error.message).toBe('The following fields are required: product, domain')
    }
  })

  test('Pass wrong API URL', () => {
    try {
      /* eslint no-new: "off" */
      new GAS({
        apiUrl: 'https://example.com',
        product: 'jira',
        domain: 'prod.domain.com'
      })
    } catch (error) {
      expect(error.message).toBe(`API URL is probably wrong or you've forgotten to add '/v1' to apiUrl`)
    }
  })

  test('Pass all required parameters to constructor', async () => {
    const gas = new GAS({ ...defaultOptions })

    const { apiUrl, product, subproduct, domain, prefix } = gas.options

    expect(apiUrl).toBe('https://example.com/v1')
    expect(product).toBe('jira')
    expect(subproduct).toBe('addon-template')
    expect(domain).toBe('prod.domain.com')
    expect(prefix).toBe(false)
  })

  test('Send event on dev environment', async () => {
    const gas = new GAS({ ...defaultOptions })

    const response = await gas.send({})
    expect(response).toEqual(null)
  })

  test('Send event on prod environment with empty object event', async () => {
    jsdom.reconfigure({
      url: 'https://prod.domain.com/'
    })

    const gas = new GAS({
      apiUrl: 'https://example.com/v1',
      product: 'jira',
      subproduct: 'addon-template',
      domain: 'prod.domain.com'
    })

    try {
      await gas.send({})
    } catch (error) {
      expect(error.message).toBe('Please pass required fields: cloudId, name!')
    }
  })

  test('Send event on prod environment with not all required fields', async () => {
    jsdom.reconfigure({
      url: 'https://prod.domain.com/'
    })

    const gas = new GAS({
      apiUrl: 'https://example.com/v1',
      product: 'jira',
      subproduct: 'addon-template',
      domain: 'prod.domain.com'
    })

    try {
      await gas.send({ name: 'test-event' })
    } catch (error) {
      expect(error.message).toBe('Please pass required fields: cloudId!')
    }
  })

  test('Send events on prod environment with not all required fields', async () => {
    jsdom.reconfigure({
      url: 'https://prod.domain.com/'
    })

    const gas = new GAS({
      apiUrl: 'https://example.com/v1',
      product: 'jira',
      subproduct: 'addon-template',
      domain: 'prod.domain.com'
    })

    try {
      await gas.send([
        { name: 'test-event' },
        { cloudId: 'test-id' }
      ])
    } catch (error) {
      expect(error.message).toBe('Please pass required fields for these events: test-event (cloudId), event [1] (name)!')
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

  test('Send event where some properties are numbers', async () => {
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
      user: 4,
      cloudId: 'https://test-cloud.atlassian.net'
    })

    expect(response.responseMessage).toBe('Processed 1 event')
  })

  test('Send empty event array', async () => {
    jsdom.reconfigure({
      url: 'https://prod.domain.com/'
    })

    const gas = new GAS({
      ...defaultOptions,
      prefix: true
    })

    const response = await gas.send([])
    expect(response).toBe(undefined)
  })
})
