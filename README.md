# Gassian

[![Greenkeeper badge](https://badges.greenkeeper.io/modestfake/gassian.svg)](https://greenkeeper.io/)

[![Build Status](https://travis-ci.org/modestfake/gassian.svg?branch=master)](https://travis-ci.org/modestfake/gassian)
[![Coverage Status](https://coveralls.io/repos/github/modestfake/gassian/badge.svg?branch=master&service=github)](https://coveralls.io/github/modestfake/gassian?branch=master)

## Installation

```bash
npm install gassian
```

```javascript
// ES6 modules
import GAS from 'gassian'

// CommonJS modules
const GAS = require('gassian')
```

## Usage

### Initialize GAS

```javascript
const gas = new GAS({
  product: 'bitbucket',
  subproduct: 'addon-template',
  domain: 'prod.atlassian.com'
})
```

#### GAS constructor parameters

| Parameter | Required | Default | Type | Description |
| --- |:---:|:---:|:---:| --- |
| apiUrl | yes | | string | Removed from the library by security reason. You can take URL from [GAS documentation](https://extranet.atlassian.com/display/ANALYTICS/Public+Analytics+aka+GAS) (Atlassian internal only). Don't forget to add version to URL |
| product | yes | | string | Product name (for add-ons main product name can be passed, e.g. jira or bitbucket) |
| subproduct | no | | string | Add-on name like `addon-template` |
| domain | yes | | string | Production domain. E.g. `prod.atlassian.com` |
| version | no | | string | '1.2.3' |
| prefix | no | false | boolean | It adds subproduct name to event name. E.g. `addon-template.project-config.visited` |
| hash | no | true | boolean | UserId and cloudId are hashed by default. Set to false if you need actual user data. |
| isServerOnProduction | yes (server only) | | boolean | We can detect actual URL in browser with `window.location.href`. But it's tricky on server-side. That's why we need it on server |

### Send event/events

```javascript
const event = {
  cloudId: 'Instance id or URL',
  user: 'User id or name',
  name: 'visited',
  page: 'project-config'
}

// To send one event pass event object to send method
gas.send(event)

// To send multiple events pass array of event objects
gas.send([event1, event2])

// Final event name is:
`project-config.visited`

// If prefix passed to constructor is true
`addon-template.project-config.visited`
```

#### Event payload

| Parameter | Required | Default | Type | Description |
| --- |:---:|:---:|:---:| --- |
| name | yes | | string | Event dotseparated name. E.g. `some-button.clicked` |
| page | no | | string | E.g. `project-config` which will included in event name as `project-config.some-button.clicked` |
| user | yes | '-' | string or integer | Unique user id which will be hashed (for not exposing private data) |
| cloudId | yes | | string or integer | Cloud id or cloud URL |
| properties | no | | object | One level nested object. Only primitive (int, float, string, bool) values are allowed |
| hash | no | | boolean or object | Enable or disabling hashing for one event. Also, it can accept object with `cloudId` or/and `user` with boolean to hash one of the values.
