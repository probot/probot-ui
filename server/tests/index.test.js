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
        issue: () => ({ number: 1 }),
        github: {
          query: jest.fn(),
          issues: {
            get: jest.fn()
          }
        },
        payload: {
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
  })
})
