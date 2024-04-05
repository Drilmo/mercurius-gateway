'use strict'

const fp = require('fastify-plugin')
const createFederationNode = require('../createFederationNode.js')

const links = {
  l1: {
    lid: 'l1',
    pid: 'p1',
    authorId: 'u1'
  },
  l2: {
    lid: 'l2',
    pid: 'p2',
    authorId: 'u2'
  },
  l3: {
    lid: 'l3',
    pid: 'p3',
    authorId: 'u1'
  },
  l4: {
    lid: 'l4',
    pid: 'p4',
    authorId: 'u2'
  },
  l5: {
    lid: 'l5',
    pid: 'p1',
    authorId: 'u2'
  },
  l6: {
    lid: 'l6',
    pid: 'p3',
    authorId: 'u2'
  }
}

module.exports = fp(
  async fastify => {
    const schema = `
      #graphql
      type Post @key(fields: "pid") @extends {
        pid: ID! @external
        title: String @external
        authors: [User]
        numberOfAuthors: Int @requires(fields: "pid title")
      }

      type User @key(fields: "id") @extends {
        id: ID! @external
        name: String @external
        posts: [Post]
        numberOfPosts: Int @requires(fields: "id name")
      }

    `

    const resolvers = {
      Post: {
        authors: post => {
          return Object.values(links).filter(l => l.pid === post.pid).map(link => {
            return {
              __typename: 'User',
              id: link.authorId
            }
          })
        },
        numberOfAuthors: post => {
          return Object.values(links).filter(l => l.pid === post.pid).length
        }
      },
      User: {
        posts: user => {
          return Object.values(links).filter(l => l.authorId === user.id).map(link => {
            return {
              __typename: 'Post',
              pid: link.pid
            }
          })
        },
        numberOfPosts: user => {
          return Object.values(links).filter(l => l.authorId === user.id).length
        }
      }
    }

    fastify.log.info('Initializing node Node 3 on port 4003')
    await createFederationNode('Node 3', schema, resolvers, 4003)
    fastify.log.info('Started node Node 3 on port 4003')
  },
  {
    name: 'node-3',
    dependencies: []
  }
)
