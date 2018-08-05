<p align="center">
  <h3 align="center">Probot UI</h3>
  <p align="center">A combination browser extension and [Probot](https://probot.github.io) extension to let your app show custom events on GitHub.<p>
  <p align="center"><a href="https://travis-ci.org/probot/probot-ui"><img src="https://badgen.now.sh/travis/probot/probot-ui" alt="Build Status"></a> <a href="https://codecov.io/gh/probot/probot-ui/"><img src="https://badgen.now.sh/codecov/c/github/probot/probot-ui" alt="Codecov"></a></p>
</p>

<p align="center">Note: This project is a work-in-progress, and not quite ready for real usage.<br>If you're interested in using it, feel free to ⭐️ the repo so we know!</p>

## How it works

This project leverages [`probot-metadata`](https://github.com/probot/metadata) to keep a hidden log of custom events in the opening post of an issue or pull request. Then, the browser extension picks up on those events and renders them in the timeline.

The browser extension is app-agnostic; as in, if its installed for the user viewing GitHub.com, it'll work for your app. **Users only need to install the browser extension once.**

## Installation (coming 🔜)

```shell
$ npm install @probot/ui
```

You (and your users) will also need to install the browser extension (coming 🔜):


| <a href=""><img alt="Google Chrome" src="https://raw.github.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" /></a> | <a href=""><img alt="Firefox" src="https://raw.github.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" /></a> |
| --- | --- |
| v49+ ✔ | v45+ ✔ |

## Usage

```js
const ExtensionConnection = require('@probot/ui')

module.exports = app => {
  app.on('issues.opened', async context => {
    const extension = new ExtensionConnection(context)
    return extension.createEvent('You opened an issue! _You\'re amazing!_')
  })
}
```

Note that you can pass [GitHub Flavored Markdown](https://lab.github.com/courses/communicating-using-markdown) to `#createEvent`; this is injected inside of a GitHub-esque UI element 👇

<p align="center">
  <img width="790" alt="image" src="https://user-images.githubusercontent.com/10660468/43688427-2ef18b34-98b6-11e8-9d0b-02fe4af6543f.png">
</p>

## Roadmap

* Better naming, `ExtensionConnection` is 👎
* ~Security considerations: stripping malicious HTML, maybe removing HTML support in favor of markdown~
* Some way of live-injecting new events.
* Passing an issue/PR number as the target for the event.
* Show a list of "custom events" in the OP, then remove it if the extension is present. That would lend _some_ support to folks who don't have the extension.
* Smarter "anchors" - currently, when events are created we check the latest comment in the thread and use that as the anchor when rendering the event. This would break for deployment events, issue locking events, etc.
* "button" attachments, that can POST to a URL on click, and look like actual buttons.
