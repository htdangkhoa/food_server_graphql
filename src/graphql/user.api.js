import { makeExecutableSchema } from 'graphql-tools'
import { sign, verify } from '../utils/jwt'
import User from '../models/user.model'

const typeDefs = `
  type User {
    _id: String
    email: String!
    fullname: String
  }

  type Token {
    accessToken: String
    refreshToken: String!
  }

  input UserRegisterRequest {
    email: String!
    password: String!
    fullname: String!
  }

  input UserLoginRequest {
    email: String!
    password: String!
  }

  type Query {
    # The accessToken is only valid for 1 hour,
    # please using refreshToken to get new accessToken.
    login(request: UserLoginRequest): Token

    renewToken(refreshToken: String!): Token

    # Get info of user.
    me: User
  }

  type Mutation {
    # This function requires email & password.
    registerUser(request: UserRegisterRequest): User
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
  
      let accessToken = sign(user, { expiresIn: '1h' })

      let refreshToken = sign(user, { expiresIn: '6h' })
  
      return resolve({ accessToken, refreshToken })
    })
  })
}

const renewToken = async (_, args) => {
  let { refreshToken } = args

  let realToken = refreshToken
    .replace(/Bearer /g, '')
    .replace(/bearer /g, '')

  let payload = await verify(`Bearer ${ realToken }`)

  if (!payload) throw 'invalid token.'
  
  let _accessToken = sign(payload, { expiresIn: '1h' })

  let _refreshToken = sign(payload, { expiresIn: '6h' })
  
  return {
    accessToken: _accessToken,
    refreshToken: _refreshToken
  }
}

const me = async (_, args, context) => {
  let { token } = context

  let payload = await verify(token)
  
  if (!payload) throw 'invalid token.'

  return payload
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

const resolvers = {
  Query: {
    login,
    renewToken,
    me
  },
  Mutation: {
    registerUser
  }
}

const schema = makeExecutableSchema({ typeDefs, resolvers })

export default schema