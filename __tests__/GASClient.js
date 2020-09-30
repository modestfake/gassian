require('cross-fetch/polyfill')
const nock = require('nock')
const GAS = require('../src')

const defaultOptions = {
  apiUrl: 'https://example.com/v1',
  product: 'jira',
  subproduct: 'addon-template',
  domain: 'prod.domain.com',
}

describe('GAS on client', () => {
  test('Pass not all required parameters', async () => {
    expect(
      () =>
        new GAS({
          apiUrl: 'https://example.com/v1',
        }),
    ).toThrow('The following fields are required: product, domain')
  })

  test('Pass wrong API URL', async () => {
    expect(
      () =>
        new GAS({
          apiUrl: 'https://example.com',
          product: 'jira',
          domain: 'prod.domain.com',
        }),
    ).toThrow(`API URL is probably wrong or you've forgotten to add '/v1' to apiUrl`)
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
      url: 'https://prod.domain.com/',
    })

    const gas = new GAS({
      apiUrl: 'https://example.com/v1',
      product: 'jira',
      subproduct: 'addon-template',
      domain: 'prod.domain.com',
    })

    await expect(gas.send({})).rejects.toMatchError(
      new Error('Please pass required fields: cloudId, name!'),
    )
  })

  test('Send event on prod environment with not all required fields', async () => {
    jsdom.reconfigure({
      url: 'https://prod.domain.com/',
    })

    const gas = new GAS({
      apiUrl: 'https://example.com/v1',
      product: 'jira',
      subproduct: 'addon-template',
      domain: 'prod.domain.com',
    })

    await expect(gas.send({ name: 'test-event' })).rejects.toMatchError(
      new Error('Please pass required fields: cloudId!'),
    )
  })

  test('Send events on prod environment with not all required fields', async () => {
    jsdom.reconfigure({
      url: 'https://prod.domain.com/',
    })

    const gas = new GAS({
      apiUrl: 'https://example.com/v1',
      product: 'jira',
      subproduct: 'addon-template',
      domain: 'prod.domain.com',
    })

    await expect(gas.send([{ name: 'test-event' }, { cloudId: 'test-id' }])).rejects.toMatchError(
      new Error(
        'Please pass required fields for these events: test-event (cloudId), event [1] (name)!',
      ),
    )
  })

  test('Send one event on prod environment', async () => {
    jsdom.reconfigure({
      url: 'https://prod.domain.com/',
    })

    const gas = new GAS({
      ...defaultOptions,
      prefix: true,
    })

    await nock('https://example.com/v1/')
      .post('/event')
      .reply(200, { responseMessage: 'Processed 1 event' })

    const response = await gas.send({
      name: 'account.visited',
      page: 'project-config',
      user: 'user-123',
      cloudId: 'https://test-cloud.atlassian.net',
    })

    expect(response.responseMessage).toBe('Processed 1 event')
  })

  test('Send event where some properties are numbers', async () => {
    jsdom.reconfigure({
      url: 'https://prod.domain.com/',
    })

    const gas = new GAS({
      ...defaultOptions,
      prefix: true,
    })

    await nock('https://example.com/v1/')
      .post('/event')
      .reply(200, { responseMessage: 'Processed 1 event' })

    const response = await gas.send({
      name: 'account.visited',
      user: 4,
      cloudId: 'https://test-cloud.atlassian.net',
    })

    expect(response.responseMessage).toBe('Processed 1 event')
  })

  test('Send empty event array', async () => {
    jsdom.reconfigure({
      url: 'https://prod.domain.com/',
    })

    const gas = new GAS({
      ...defaultOptions,
      prefix: true,
    })

    const response = await gas.send([])
    expect(response).toBe(undefined)
  })

  test('Logging is true and environment is not production', async () => {
    jsdom.reconfigure({
      url: 'https://dev.domain.com/',
    })

    // eslint-disable-next-line no-console
    console.log = jest.fn()

    const gas = new GAS({
      ...defaultOptions,
      logging: true,
    })

    await gas.send({
      name: 'test-event',
      user: 'user-123',
      cloudId: 'test-cloud-id',
    })

    expect(console.log).toHaveBeenCalled()
    // TODO: check if fetch is not called
  })

  test('Logging is true and environment is production', async () => {
    jsdom.reconfigure({
      url: 'https://prod.domain.com/',
    })

    const gas = new GAS({
      ...defaultOptions,
      logging: true,
    })

    await nock('https://example.com/v1/')
      .post('/event')
      .reply(200, { responseMessage: 'Processed 1 event' })

    await gas.send({
      name: 'test-event',
      user: 'user-123',
      cloudId: 'test-cloud-id',
    })

    expect(console.log).toHaveBeenCalled()
    // TODO: check if fetch is called
  })
})
