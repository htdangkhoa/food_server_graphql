import { makeExecutableSchema } from 'graphql-tools'
import { verify } from '../utils/jwt'
import Food from '../models/food.model'

const typeDefs = `
  type Food {
    _id: String
    name: String
    address: String
    description: String
    price: Int
    rating: Float!
    tags: [String]!
  }

  input FoodRequest {
    name: String!
    address: String!
    description: String
    price: Int
    rating: Float
    tags: [String]
  }

  type Query {
    getAllFoods(skip: Int): [Food]

    # q requires a array os String.
    searchFood(q: [String]!): [Food]
  }

  type Mutation {
    # This function requires token to access.
    addFood(request: FoodRequest): Food
  }
`

const getAllFoods = async (_, args) => {
  let { skip } = args

  let foods = await Food.find()
    .skip((skip || 0) * 10)
    .limit(10)

  return foods
}

const addFood = async (_, args, context) => {
  let { token } = context

  let payload = await verify(token)
  
  if (!payload) throw 'invalid token.'

  let { request } = args
  if (request.rating)
    request.rating = parseFloat((request.rating).toFixed(1))

  let food = new Food(request)

  try {
    let result = await food.save()

    return result
  } catch (error) {
    throw error
  }
}

const searchFood = async (_, args) => {
  let { q } = args

  let foods = await Food.find({ tags: { '$in': q } })

  return foods
}

const resolvers = {
  Query: {
    getAllFoods,
    searchFood
  },
  Mutation: {
    addFood
  }
}

const schema = makeExecutableSchema({ typeDefs, resolvers })

export default schema