/**
 * @jest-environment node
 */

const nock = require('nock')
const fetch = require('node-fetch')
const GAS = require('../src')

describe('GAS on server', () => {
  test('Send event on server-side without providing a fetch library', async () => {
    try {
      /* eslint no-new: "off" */
      new GAS({
        apiUrl: 'https://example.com/v1',
        product: 'jira',
        subproduct: 'addon-template',
        domain: 'prod.domain.com',
        isServerOnProduction: true
      })
    } catch (error) {
      expect(error.message).toBe('The following fields are required: fetch')
    }
  })

  test('Send event on server-side without providing a fetch library', async () => {
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
})
