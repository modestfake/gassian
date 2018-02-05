const { format } = require('../src/utils')

const options = {
  product: 'jira',
  subproduct: 'addon-template',
  domain: 'prod.domain.com',
  hash: true
}

const event = {
  name: 'foo.bar',
  cloudId: 'prod.example.com',
  user: 'test-user-id'
}

describe('Unit test of format function', () => {
  test('Global hash enabled', () => {
    const {
      name,
      cloud_id: cloudId,
      user,
      product,
      subproduct,
      server,
      version
    } = format(options, event)

    expect(name).toBe('foo.bar')
    expect(cloudId).toBe('5dfb5f9a5c63abd2ab8fc2746c5927744f15d045')
    expect(user).toBe('f03b173eb4914e48632b509e468202f04724d1a1')
    expect(product).toBe('jira')
    expect(subproduct).toBe('addon-template')
    expect(server).toBe('prod.domain.com')
    expect(version).toBe(undefined)
  })

  test('Global hash is disabled', () => {
    const { cloud_id: cloudId, user } = format(
      { ...options, hash: false },
      event
    )

    expect(cloudId).toBe('prod.example.com')
    expect(user).toBe('test-user-id')
  })

  test('Global hash is enabled but for current event is disabled', () => {
    const { cloud_id: cloudId, user } = format(
      options,
      { ...event, hash: false }
    )

    expect(cloudId).toBe('prod.example.com')
    expect(user).toBe('test-user-id')
  })

  test('Global hash is disabled but for current event is enabled', () => {
    const { cloud_id: cloudId, user } = format(
      { ...options, hash: false },
      { ...event, hash: true }
    )

    expect(cloudId).toBe('5dfb5f9a5c63abd2ab8fc2746c5927744f15d045')
    expect(user).toBe('f03b173eb4914e48632b509e468202f04724d1a1')
  })

  test('Global hash is enabled but for user is disabled', () => {
    const { cloud_id: cloudId, user } = format(
      options,
      { ...event, hash: { user: false } }
    )

    expect(cloudId).toBe('5dfb5f9a5c63abd2ab8fc2746c5927744f15d045')
    expect(user).toBe('test-user-id')
  })

  test('Global hash is disabled but for cloudId is enabled', () => {
    const { cloud_id: cloudId, user } = format(
      { ...options, hash: false },
      { ...event, hash: { cloudId: true } }
    )

    expect(cloudId).toBe('5dfb5f9a5c63abd2ab8fc2746c5927744f15d045')
    expect(user).toBe('test-user-id')
  })
})
