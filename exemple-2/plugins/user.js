'use strict'

const fp = require('fastify-plugin')
const createFederationNode = require('../createFederationNode.js')

const users = {
  u1: {
    id: 'u1',
    name: 'John'
  },
  u2: {
    id: 'u2',
    name: 'Jane'
  },
  u3: {
    id: 'u3',
    name: 'Jack'
  }
}

module.exports = fp(
  async fastify => {
    const schema = `
    #graphql
    extend type Query {
      me: User
      you: User
      hello: String
      topUsers(count: Int): [User]
    }

    type User @key(fields: "id") {
      id: ID!
      name: String!
      fullName: String
      avatar(size: AvatarSize): String
      friends: [User]
    }

    enum AvatarSize {
      small
      medium
      large
    }
`

    const resolvers = {
      Query: {
        me: () => {
          return users.u1
        },
        you: () => {
          throw new Error("Can't fetch other users data, NOT_ALLOWED")
        },
        hello: () => 'world',
        topUsers: (root, { count = 2 }) => Object.values(users).slice(0, count)
      },
      User: {
        __resolveReference: user => {
          return users[user.id]
        },
        avatar: (user, { size }) => `avatar-${size}.jpg`,
        friends: user => Object.values(users).filter(u => u.id !== user.id),
        fullName: user => user.name + ' Doe'
      }
    }

    fastify.log.info('Initializing node Node 1 on port 4001')
    await createFederationNode('Node 1', schema, resolvers, 4001)
    fastify.log.info('started node Node 1 on port 4001')
  },
  {
    name: 'node-1',
    dependencies: []
  }
)
