/**
 * @jest-environment node
 */

require('cross-fetch/polyfill')
const nock = require('nock')
const GAS = require('../src')

describe('GAS on server', () => {
  test('Send multiple events', async () => {
    const gas = new GAS({
      apiUrl: 'https://example.com/v1',
      product: 'jira',
      subproduct: 'addon-template',
      domain: 'prod.domain.com',
      isServerOnProduction: true,
      fetch
    })

    await nock('https://example.com/v1/')
    .post('/events')
    .reply(200, { responseMessage: 'Processed 2 event' })

    const response = await gas.send([
      {
        name: 'account.visited',
        page: 'project-config',
        user: 'user-123',
        cloudId: 'https://test-cloud.atlassian.net'
      },
      {
        name: 'account.opened',
        page: 'project-config',
        user: 'user-123',
        cloudId: 'https://test-cloud.atlassian.net'
      }
    ])

    expect(response.responseMessage).toBe('Processed 2 event')
  })

  test('Send event with "undefined" values', async () => {
    const gas = new GAS({
      apiUrl: 'https://example.com/v1',
      product: 'jira',
      subproduct: 'addon-template',
      domain: 'prod.domain.com',
      isServerOnProduction: true,
      fetch
    })

    try {
      await gas.send({
        name: 'account.visited',
        user: undefined,
        cloudId: undefined
      })
    } catch (error) {
      expect(error.message).toBe('Please pass required fields: user, cloudId!')
    }
  })
})
