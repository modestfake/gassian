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
    expect(cloudId).toBe('e86ec0156714aa4501735f4fc66fc812')
    expect(user).toBe('7349ddfd75b6f5b3325bacdaf3a913cb')
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

    expect(cloudId).toBe('e86ec0156714aa4501735f4fc66fc812')
    expect(user).toBe('7349ddfd75b6f5b3325bacdaf3a913cb')
  })

  test('Global hash is enabled but for user is disabled', () => {
    const { cloud_id: cloudId, user } = format(
      options,
      { ...event, hash: { user: false } }
    )

    expect(cloudId).toBe('e86ec0156714aa4501735f4fc66fc812')
    expect(user).toBe('test-user-id')
  })

  test('Global hash is disabled but for cloudId is enabled', () => {
    const { cloud_id: cloudId, user } = format(
      { ...options, hash: false },
      { ...event, hash: { cloudId: true } }
    )

    expect(cloudId).toBe('e86ec0156714aa4501735f4fc66fc812')
    expect(user).toBe('test-user-id')
  })
})
