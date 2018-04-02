const { format } = require('../src/util')

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
    } = format(event, options)

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
      event,
      { ...options, hash: false }
    )

    expect(cloudId).toBe('prod.example.com')
    expect(user).toBe('test-user-id')
  })

  test('Global hash is enabled but for current event is disabled', () => {
    const { cloud_id: cloudId, user } = format(
      { ...event, hash: false },
      options
    )

    expect(cloudId).toBe('prod.example.com')
    expect(user).toBe('test-user-id')
  })

  test('Global hash is disabled but for current event is enabled', () => {
    const { cloud_id: cloudId, user } = format(
      { ...event, hash: true },
      { ...options, hash: false }
    )

    expect(cloudId).toBe('e86ec0156714aa4501735f4fc66fc812')
    expect(user).toBe('7349ddfd75b6f5b3325bacdaf3a913cb')
  })

  test('Global hash is enabled but for user is disabled', () => {
    const { cloud_id: cloudId, user } = format(
      { ...event, hash: { user: false } },
      options
    )

    expect(cloudId).toBe('e86ec0156714aa4501735f4fc66fc812')
    expect(user).toBe('test-user-id')
  })

  test('Global hash is disabled but for cloudId is enabled', () => {
    const { cloud_id: cloudId, user } = format(
      { ...event, hash: { cloudId: true } },
      { ...options, hash: false }
    )

    expect(cloudId).toBe('e86ec0156714aa4501735f4fc66fc812')
    expect(user).toBe('test-user-id')
  })

  test('Passing numbers to event object results to strings', () => {
    const { cloud_id: cloudId, user } = format(
      { name: 'foo.bar', cloudId: 12345, user: 123 },
      { ...options, hash: false }
    )

    expect(cloudId).toBe('12345')
    expect(user).toBe('123')
  })
})
