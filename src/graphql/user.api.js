import { makeExecutableSchema } from 'graphql-tools'
import { sign, verify } from '../utils/jwt'
import User from '../models/user.model'

const typeDefs = `
  type User {
    _id: String
    email: String!
  }

  type Token {
    token: String
  }

  input UserRequest {
    email: String!
    password: String!
  }

  type Query {
    # This function requires email & password.
    login(request: UserRequest): Token

    # Get info of user.
    me: User
  }

  type Mutation {
    # This function requires email & password.
    registerUser(request: UserRequest): User
  }
`

const login = async (_, args) => {
  let { email, password } = args.request

  let user = await User.findOne({ email })

  if (!user) throw `Email or password is not correct.`
  
  return new Promise((resolve, reject) => {
    user.comparePassword(password, function (error, isMatch) {
      if (error) throw error
  
      if (!isMatch) return reject(`Email or password is not correct.`) 
  
      let token = sign(user)
  
      return resolve({ token })
    })
  })
}

const registerUser = async (_, args) => {
  let { request } = args

  let user = new User(request)

  try {
    let result = await user.save()
    
    return user
  } catch (error) {
    throw error
  }
}

const me = async (_, args, context) => {
  let { token } = context

  let payload = await verify(token)
  
  if (!payload) throw 'invalid token.'

  return payload
}

const resolvers = {
  Query: {
    login,
    me
  },
  Mutation: {
    registerUser
  }
}

const schema = makeExecutableSchema({ typeDefs, resolvers })

export default schema