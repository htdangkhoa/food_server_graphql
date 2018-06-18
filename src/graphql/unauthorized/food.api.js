import { makeExecutableSchema } from 'graphql-tools'
import Food from '../../models/food.model'

const typeDefs = `
  type Food {
    _id: String
    name: String
    address: String
    description: String
    price: Int
    rating: Float!
    tags: [String]!
    images: [String]!
  }

  input FoodRequest {
    name: String!
    address: String!
    description: String!
    price: Int!
    rating: Float
    tags: [String]!
    images: [String]
  }

  type Query {
    getAllFoods(skip: Int): [Food]

    # q is a array of string.
    searchFoodByTags(q: [String]!): [Food]

    # q is a string.
    searchFoodByName(q: String!): [Food]
  }
`

const getAllFoods = async (_, args) => {
  let { skip } = args

  let foods = await Food.find()
    .skip((skip || 0) * 10)
    .limit(10)

  return foods
}

const searchFoodByTags = async (_, args) => {
  let { q } = args

  let foods = await Food.find({ tags: { '$in': q } })

  return foods
}

const searchFoodByName = async (_, args) => {
  let { q } = args

  let foods = await Food.find({
    name: {
      $regex: q,
      $options: 'i'
    }
  })

  return foods
}

const resolvers = {
  Query: {
    getAllFoods,
    searchFoodByTags,
    searchFoodByName
  }
}

const schema = makeExecutableSchema({ typeDefs, resolvers })

export default schema