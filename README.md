# Gassian

Tiny API wrapper over Atlassian public analytics (GAS)

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
  subproduct: 'jira-addon-template',
  prodDomain: 'prod.atlassian.com'
})
```

#### GAS constructor parameters

| Parameter | Required | Default | Type | Description |
| --- |:---:|:---:|:---:| --- |
| apiUrl | yes | | string | Removed from the library by security reason. You can take URL from [GAS documentation](https://extranet.atlassian.com/display/ANALYTICS/Public+Analytics+aka+GAS) (Atlassian internal only) |
| product | no | 'jira' | string | The product that your add-on appearance in |
| subproduct | yes | | string | Add-on name like `jira-addon-template` |
| prodDomain | yes | | string | E.g. `prod.atlassian.com` |
| version | no | | string | '1.2.3' |
| prefix | no | false | boolean | Add add-on name to event name. E.g. `jira-addon-template.project-config.visited` |
| fetch | no | | fetch library | For server only. E.g. pass `require('node-fetch')` |
| detectProd | yes (server only) | | function | We can detect URL in browser with `window.location.href`. But it's tricky on server-side. This function will execute every time when you try to send event. |

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
