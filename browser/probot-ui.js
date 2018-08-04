class Event {
  /**
   * @constructor
   * @param {EventObject} event
   */
  constructor (event) {
    this.event = event
  }

  /**
   * Get the HTML element that this event should be
   * rendered after. If there are no comments, this will return the OP.
   * @returns {HTMLElement}
   */
  getPreviousNode (op) {
    const { after } = this.event

    // If the event has an `after` key,
    // use comment with that id as the anchor
    if (after) {
      const comment = document.querySelector(`#issuecomment-${after}`)
      return comment.parentElement
    } else {
      return op
    }
  }

  /**
   * Decorates the provided body with some fancy
   * Primer-esque HTML, as well as the avatar of the app.
   * @param {EventObject}
   * @returns {string}
   */
  decorateBody ({ login, avatarUrl, body }) {
    return `<div class="timeline-comment-wrapper">
      <div class="Box p-3 d-flex">
        <div class="mr-2 tooltipped tooltipped-n" aria-label="${login}">
          <img src="${avatarUrl}" class="avatar avatar-small" width="22" height="22" />
        </div>
        <div>${body}</div>
      </div>
    </div>`
  }

  /**
   * Render the event into the issue timeline
   */
  render (op) {
    const previousNode = this.getPreviousNode(op)
    const decoratedBody = this.decorateBody(this.event)
    previousNode.insertAdjacentHTML('afterend', decoratedBody)
  }
}

/**
 * Get an array of events from the original post
 * @returns {EventObject[]}
 */
function getEvents () {
  const regex = /\n\n<!-- probot = (.*) -->/
  const body = op.querySelector('.comment-form-textarea').value
  const matches = body.match(regex)

  if (!matches) return

  const object = JSON.parse(matches[1])
  const keys = Object.keys(object)

  const events = []
  for (const key of keys) {
    const keyEvents = object[key].events
    if (keyEvents) events.push(...keyEvents)
  }
  return events
}

/**
 * Render the event objects
 * @param {EventObject[]} events
 */
function renderEvents (events) {
  events.forEach(event => {
    const e = new Event(event)
    return e.render()
  })
}

// All issue or PR comments
const comments = document.querySelectorAll('.timeline-comment-wrapper')

if (comments) {
  // Original comment
  const op = comments[0]
  const events = getEvents(op)
  renderEvents(events)
}

/**
 * @typedef {object} EventObject
 * @prop {string} login - GitHub App login
 * @prop {string} avatarUrl - GitHub App's avatar URL
 * @prop {string} body - Event body HTML string
 * @prop {?number} after - ID of a comment
 */
