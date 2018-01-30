# Gassian

[![Build Status](https://travis-ci.org/modestfake/gassian.svg?branch=master)](https://travis-ci.org/modestfake/gassian)
[![Coverage Status](https://coveralls.io/repos/github/modestfake/gassian/badge.svg?branch=master)](https://coveralls.io/github/modestfake/gassian?branch=master)

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
  subproduct: 'bb-addon-template',
  prodDomain: 'prod.atlassian.com'
})
```

#### GAS constructor parameters

| Parameter | Required | Default | Type | Description |
| --- |:---:|:---:|:---:| --- |
| apiUrl | yes | | string | Removed from the library by security reason. You can take URL from [GAS documentation](https://extranet.atlassian.com/display/ANALYTICS/Public+Analytics+aka+GAS) (Atlassian internal only) |
| product | no | 'jira' | string | The product that your add-on appearance in |
| subproduct | yes | | string | Add-on name like `bb-addon-template` |
| prodDomain | yes | | string | E.g. `prod.atlassian.com` |
| version | no | | string | '1.2.3' |
| prefix | no | false | boolean | Add add-on name to event name. E.g. `bb-addon-template.project-config.visited` |
| hash | no | true | boolean | UserId and cloudId are hashed by default. Set to false if you need actual user data |
| fetch | no | | fetch library | For server only. E.g. pass `require('node-fetch')` |
| detectProduction | yes (server only) | | function | We can detect URL in browser with `window.location.href`. But it's tricky on server-side. This function will execute every time when you try to send event. Should return `true` or `false` |

### Send event/events

```javascript
const event = {
  user: 'User id',
  cloudId: 'Instance id or URL',
  name: 'Event name',
  page: 'project-config'
}

// To send one event pass event object to sendmethod
gas.send(event)

// To send multiple events pass array of event objects
gas.send([event1, event2])

// Final event name is:
`project-config.salesforce.visit`

// If prefix passed to constructor is true
`jira-crm-integration.project-config.salesforce.visit`
```

#### Event payload

| Parameter | Required | Type | Description |
| --- |:---:|:---:| --- |
| name | yes | string | Event dotseparated name. E.g. `some-button.clicked` |
| page | no | string | E.g. `project-config` which will included in event name as `project-config.some-button.clicked` |
| user | yes | string | Unique user id which will be hashed (for not exposing private data) |
| cloudId | yes | string | Cloud id or cloud URL |
| properties | no | object | One level nested object. Only primitive (int, float, string, bool) values are allowed |
| hash | no | boolean | Enable or disabling hashing for one event
