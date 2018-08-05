const { go, renderEvents, getEvents, Event } = require('..')

describe('browser', () => {
  let metadata, html

  beforeEach(() => {
    metadata = {
      123: {
        events: [{
          after: null,
          body: 'You opened an issue!',
          avatarUrl: 'https://avatars2.githubusercontent.com/in/10739?v=4',
          login: 'super-duper-dev[bot]'
        }]
      }
    }

    html = meta => {
      document.body.innerHTML = `<div class="timeline">
        <div class="timeline-comment-wrapper">
          <textarea class="comment-form-textarea">
            Hello!

            <!-- probot = ${JSON.stringify(meta)} -->
          </textarea>
        </div>
      </div>`
    }

    html(metadata)
  })

  describe('getEvents', () => {
    it('gets an array of all events from the OP', () => {
      const op = document.querySelector('.timeline-comment-wrapper')
      expect(getEvents(op)).toEqual(metadata[123].events)
    })

    it('gets an array of all events from multiple installations from the OP', () => {
      metadata[1234] = { events: [{
        after: null,
        body: '<div>You opened another issue!</div>',
        avatarUrl: 'https://avatars2.githubusercontent.com/in/10739?v=4',
        login: 'super-duper-trooper-dev[bot]'
      }] }
      html(metadata)
      const op = document.querySelector('.timeline-comment-wrapper')
      expect(getEvents(op)).toEqual([...metadata[123].events, ...metadata[1234].events])
    })

    it('returns undefined if there is no metadata', () => {
      document.body.innerHTML = `<div class="timeline">
        <div class="timeline-comment-wrapper">
          <textarea class="comment-form-textarea">
            Hello!
          </textarea>
        </div>
      </div>`
      const op = document.querySelector('.timeline-comment-wrapper')
      const events = getEvents(op)
      expect(events).toBe(undefined)
    })

    it('returns an empty array if no metadata keys have events', () => {
      document.body.innerHTML = `<div class="timeline">
        <div class="timeline-comment-wrapper">
          <textarea class="comment-form-textarea">
            Hello!
            <!-- probot = ${JSON.stringify({ 123: { test: true } })} -->
          </textarea>
        </div>
      </div>`
      const op = document.querySelector('.timeline-comment-wrapper')
      const events = getEvents(op)
      expect(events).toEqual([])
    })
  })

  describe('renderEvents', () => {
    it('renders an event to the DOM', () => {
      const op = document.querySelector('.timeline-comment-wrapper')
      const events = getEvents(op)
      renderEvents(events, op)

      const renderedEvent = document.querySelector('.js-probot-ui')
      expect(renderedEvent.previousSibling).toBe(op)
      expect(renderedEvent).toMatchSnapshot()
      expect(document.body.innerHTML).toMatchSnapshot()
    })
  })

  describe('Event', () => {
    let event, op

    beforeEach(() => {
      op = document.querySelector('.timeline-comment-wrapper')
      event = new Event({
        after: null,
        body: 'Hello!',
        avatarUrl: 'https://image.com/image.png',
        login: 'my-app[bot]'
      }, op)
    })

    describe('#getPreviousNode', () => {
      it('returns the op if there are no comments', () => {
        expect(event.getPreviousNode()).toEqual(op)
      })

      it('returns a comment element that matches the event\'s `after` key', () => {
        const after = 12345
        document.body.innerHTML = `<div class="timeline">
          <div class="timeline-comment-wrapper">
            <textarea class="comment-form-textarea">
              Hello!

              <!-- probot = ${JSON.stringify(metadata)} -->
            </textarea>
          </div>
          <div class="timeline-comment-wrapper">
            <div id="issuecomment-${after}"></div>
          </div>
        </div>`
        const op = document.querySelector('.timeline-comment-wrapper')
        event = new Event({
          after,
          body: 'Hello!',
          avatarUrl: 'https://image.com/image.png',
          login: 'my-app[bot]'
        }, op)

        const previousNode = event.getPreviousNode()
        expect(previousNode.firstElementChild.id).toBe(`issuecomment-${after}`)
      })
    })

    describe('#decorateBody', () => {
      it('returns a decorated HTML string', () => {
        const decorated = event.decorateBody({
          login: 'my-dope-app[bot]',
          avatarUrl: 'https://image.com/image.png',
          body: 'Hello!'
        })
        expect(decorated).toMatchSnapshot()
      })
    })

    describe('#render', () => {
      it('injects the event after the op', () => {
        event.render()
        const renderedEvent = document.querySelector('.js-probot-ui')
        expect(renderedEvent.previousSibling).toBe(op)
        expect(renderedEvent).toMatchSnapshot()
        expect(document.body.innerHTML).toMatchSnapshot()
      })

      it('strips unsafe HTML', () => {
        event.event.body = 'Do not show this: <script>alert("OH NO!")</script>'
        event.render()
        expect(document.body.querySelectorAll('script').length).toBe(0)
      })
    })
  })

  describe('go', () => {
    it('does nothing if there are no comments', () => {
      document.body.innerHTML = ''
      go()
      expect(document.body.innerHTML).toBe('')
    })

    it('does nothing if there are no events', () => {
      const body = `<div class="timeline">
        <div class="timeline-comment-wrapper">
          <textarea class="comment-form-textarea">
            Hello!
            <!-- probot = ${JSON.stringify({ 123: { test: true } })} -->
          </textarea>
        </div>
      </div>`
      document.body.innerHTML = body
      go()
      expect(document.body.innerHTML).toMatchSnapshot()
    })

    it('injects an event', () => {
      const op = document.querySelector('.timeline-comment-wrapper')
      go()
      const renderedEvent = document.querySelector('.js-probot-ui')
      expect(renderedEvent.previousSibling).toBe(op)
      expect(renderedEvent).toMatchSnapshot()
      expect(document.body.innerHTML).toMatchSnapshot()
    })
  })
})
