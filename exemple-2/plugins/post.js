'use strict'

const fp = require('fastify-plugin')
const createFederationNode = require('../createFederationNode.js')

const posts = {
  p1: {
    pid: 'p1',
    title: 'Post 1',
    content: 'Content 1'
  },
  p2: {
    pid: 'p2',
    title: 'Post 2',
    content: 'Content 2'
  },
  p3: {
    pid: 'p3',
    title: 'Post 3',
    content: 'Content 3'
  },
  p4: {
    pid: 'p4',
    title: 'Post 4',
    content: 'Content 4'
  }
}

module.exports = fp(
  async fastify => {
    const schema = `
      #graphql
      type Post @key(fields: "pid") {
        pid: ID!
        title: String
        content: String
      }

      type Query @extends {
        topPosts(count: Int): [Post]
      }

      extend type Mutation {
        createPost(post: PostInput!): Post
        updateHello: String
      }

      input PostInput {
        title: String!
        content: String!
        authorId: String!
      }
    `

    const resolvers = {
      Post: {
        __resolveReference: post => {
          return posts[post.pid]
        }
      },
      Query: {
        topPosts: (root, { count = 2 }) => Object.values(posts).slice(0, count)
      },
      Mutation: {
        createPost: (root, { post }) => {
          const pid = `p${Object.values(posts).length + 1}`

          const result = {
            pid,
            ...post
          }
          posts[pid] = result

          return result
        },
        updateHello: () => 'World'
      }
    }

    fastify.log.info('Initializing node Node 2 on port 4002')
    await createFederationNode('Node 2', schema, resolvers, 4002)
    fastify.log.info('Started node Node 2 on port 4002')
  },
  {
    name: 'node-2',
    dependencies: []
  }
)
