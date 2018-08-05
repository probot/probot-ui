<p align="center">
  <h3 align="center">Probot UI</h3>
  <p align="center">A combination browser extension and Probot extension to let your app show custom events on GitHub.<p>
</p>

<p align="center">This project is a work-in-progress.</p>

## How it works

This project leverages [`probot-metadata`](https://github.com/probot/metadata) to keep a hidden log of custom events in the opening post of an issue or pull request. Then, the browser extension picks up on those events and renders them in the timeline. This means that 

## Installation

```shell
$ npm install @probot/ui
```

You'll also need to install the browser extension (coming 🔜):

[Google Chrome] &middot; [Firefox]

## Usage

```js
const ExtensionConnection = require('@probot/ui')

module.exports = app => {
  app.on('issues.opened', async context => {
    const extension = new ExtensionConnection(context)
    return extension.createEvent('<div>You opened an issue!</div>')
  })
}
```

<p align="center">
  <img width="784" alt="image" src="https://user-images.githubusercontent.com/10660468/43681165-741f0bc4-981a-11e8-96ac-e10bb7958502.png">
</p>

## Roadmap

* Better naming, `ExtensionConnection` is 👎
* Some way of live-injecting new events.
* Passing an issue/PR number as the target for the event.
* Show a list of "custom events" in the OP, then remove it if the extension is present. That would lend _some_ support to folks who don't have the extension.
* Smarter "anchors" - currently, when events are created we check the latest comment in the thread and use that as the anchor when rendering the event. This would break for deployment events, issue locking events, etc.
