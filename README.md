<p align="center">
  <img src="https://avatars2.githubusercontent.com/in/5534?s=128&v=4" width="64">
  <h3 align="center">Probot UI</h3>
  <p align="center">A combination browser extension and Probot extension to let your app show custom events on GitHub.<p>
  </p>
</p>

> This project is a work-in-progress.

## Usage

```js
const ExtensionConnection = require('../probot-ui')

module.exports = app => {
  app.on('issues.opened', async context => {
    const extension = new ExtensionConnection(context)
    return extension.createEvent('<div>You opened an issue!</div>')
  })
}
```

<img width="784" alt="image" src="https://user-images.githubusercontent.com/10660468/43681165-741f0bc4-981a-11e8-96ac-e10bb7958502.png">
