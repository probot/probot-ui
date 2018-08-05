const ExtensionConnection = require('..')

describe('ExtensionConnection', () => {
  describe('constructor', () => {
    it('throws an error if the context does not have a number', () => {
      const context = { issue: () => ({}) }
      try {
        // eslint-disable-next-line
        const extension = new ExtensionConnection(context)
      } catch (err) {
        expect(err).toMatchSnapshot()
      }
    })
  })

  describe('methods', () => {
    let extension, context

    beforeEach(() => {
      context = {
        issue: function (o) {
          return {
            owner: this.payload.repository.owner.login,
            repo: this.payload.repository.name,
            number: (this.payload.issue || this.payload.pull_request).number,
            ...o
          }
        },
        repo: o => ({ owner: 'JasonEtco', repo: 'pizza', ...o }),
        github: {
          query: jest.fn(),
          issues: {
            get: jest.fn(() => Promise.resolve({ data: { body: '' } })),
            edit: jest.fn()
          }
        },
        payload: {
          repository: {
            owner: { login: 'JasonEtco' },
            name: 'pizza'
          },
          issue: {
            number: 1,
            body: 'Hello!'
          },
          installation: {
            id: 123
          }
        }
      }

      extension = new ExtensionConnection(context)
    })

    describe('#getType', () => {
      it('returns an issue type', async () => {
        context.github.query.mockReturnValueOnce(Promise.resolve({
          resource: { __typename: 'Issue' }
        }))
        const type = await extension.getType()
        expect(type).toEqual('issue')
      })

      it('returns a pullRequest type', async () => {
        context.github.query.mockReturnValueOnce(Promise.resolve({
          resource: { __typename: 'PullRequest' }
        }))
        const type = await extension.getType()
        expect(type).toEqual('pullRequest')
      })
    })

    describe('#getLatestComment', () => {
      it('returns the id of the latest comment', async () => {
        extension.getType = jest.fn(() => Promise.resolve('issue'))
        context.github.query.mockReturnValueOnce(Promise.resolve({
          repository: { issue: { comments: {
            totalCount: 1,
            nodes: [{ databaseId: 123 }]
          } } }
        }))

        expect(await extension.getLatestComment()).toBe(123)
      })

      it('returns null if there are no comments', async () => {
        extension.getType = jest.fn(() => Promise.resolve('issue'))
        context.github.query.mockReturnValueOnce(Promise.resolve({
          repository: { issue: { comments: {
            totalCount: 0
          } } }
        }))

        expect(await extension.getLatestComment()).toBe(null)
      })
    })

    describe('#createEvent', () => {
      it('adds an event to the issue body', async () => {
        extension.getLatestComment = jest.fn(() => Promise.resolve(null))
        extension.getApp = jest.fn(() => Promise.resolve({ avatarUrl: 'https://image.com/image.png', login: 'my-dope-app[bot]' }))
        await extension.createEvent('Hello!')
        expect(context.github.issues.edit).toHaveBeenCalled()
        expect(context.github.issues.edit.mock.calls[0][0]).toMatchSnapshot()
      })
    })
  })
})
