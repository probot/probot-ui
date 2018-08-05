const metadata = require('probot-metadata')

class ExtensionConnection {
  /**
   * @constructor
   * @param {import('probot').Context} context - Probot's context object
   */
  constructor (context) {
    if (!context.issue().number) throw new Error('ExtensionConnection can only be used on issues or pull requests.')

    this.context = context
    this.metadata = metadata(this.context)
    this.get = this.metadata.get
    this.set = this.metadata.set
  }

  /**
   * Check if this resource is an issue or pull request
   * @returns {string} - Either `issue` or `pullRequest`
   */
  async getType () {
    const { github, payload } = this.context
    const query = `query ($url: URI!) {
      resource (url: $url) {
        __typename
      }
    }`

    const url = (payload.issue || payload.pull_request).html_url
    const response = await github.query(query, { url })

    // Schema types and Resource types have different casing
    const schemaTypes = {
      PullRequest: 'pullRequest',
      Issue: 'issue'
    }

    return schemaTypes[response.resource.__typename]
  }

  /**
   * Get the id of the latest comment in the issue/PR.
   * This will return null if the issue/PR has no comments.
   * @returns {?number}
   */
  async getLatestComment () {
    const type = await this.getType()
    const query = `query ($owner: String!, $repo: String!, $number: Int!) {
      repository (owner: $owner, name: $repo) {
        ${type} (number: $number) {
          comments (last: 1) {
            totalCount
            nodes {
              databaseId
            }
          }
        }
      }
    }`

    const response = await this.context.github.query(query, this.context.issue())
    const { comments } = response.repository[type]
    if (comments.totalCount === 0) return null
    return comments.nodes[0].databaseId
  }

  /**
   * Get information about the authenticated GitHub App
   * @returns {App}
   */
  async getApp () {
    const query = `{
      viewer {
        avatarUrl
        login
      }
    }`
    const response = await this.context.github.query(query)
    return response.viewer
  }

  /**
   * @returns {EventObject}
   */
  async getEvents () {
    const events = await this.get('events')
    return events
  }

  /**
   * Create an event for this issue or pull request.
   * @param {string} body - HTML string
   */
  async createEvent (body) {
    const after = await this.getLatestComment()
    const appData = await this.getApp()
    const newEvent = { after, body, ...appData }
    const events = await this.getEvents() || []
    return this.set('events', [...events, newEvent])
  }
}

module.exports = ExtensionConnection

/**
 * @typedef {object} App
 * @param {string} avatarUrl
 * @param {string} login
 */

/**
 * @typedef {object} EventObject
 * @prop {string} login - GitHub App login
 * @prop {string} avatarUrl - GitHub App's avatar URL
 * @prop {string} body - Event body HTML string
 * @prop {?number} after - ID of a comment
 */
