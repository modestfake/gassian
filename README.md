# Atlassian GAS

Tiny API wrapper over Atlassian public analytics (GAS)

[Link to GAS documentention](https://extranet.atlassian.com/display/ANALYTICS/Public+Analytics+aka+GAS) (Atlassian internal only)

## Usage

### Create GAS instance

```javascript
import GAS from 'atlassian-gas'

const gas = new GAS({
  product: 'Main product name', // 'jira' by default
  subproduct: 'Add-on name', // required, e.g. 'jira-crm-integration'
  prodDomain: 'Production domain', // required,  e.g. 'prod.atlassian.com'
  version: 'Add-on version', // '1.2.3'
  prefix: true, // prefixing event name with add-on name, false by default
  detectProd: [Function] // Provide function to detect production if runs on server
})
```

### Send event/events

```javascript
const event = {
  user: 'User id', // required
  cloudId: 'Instance id or URL', // required
  name: 'Event name', // required, e.g. 'salesforce.visit'
  page: 'project-config' // optional
}

// Final event name will be:
// project-config.salesforce.visit
// If prefix is true
// jira-crm-integration.project-config.salesforce.visit

gas.send(event)

// Can be an array
gas.send([event1, event2])
```
