import { makeExecutableSchema } from 'graphql-tools'
import { sign, verify } from '../../utils/jwt'

const typeDefs = `
  type User {
    _id: String
    email: String!
    fullname: String
  }

  type Query {
    # Get info of user.
    me: User
  }
`

const me = async (_, args, context) => {
  let { user } = context

  return user
}

const resolvers = {
  Query: {
    me
  }
}

const schema = makeExecutableSchema({ typeDefs, resolvers })

export default schema