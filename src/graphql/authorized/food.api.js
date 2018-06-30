import { makeExecutableSchema } from 'graphql-tools'
import lodash from 'lodash'
import Food from '../../models/food.model'

const typeDefs = `
  enum SearchTypes {
    BY_TAGS,
    BY_NAME
  }

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

  input SearchFoodRequest {
    type: SearchTypes!,
    tags: [String],
    name: String
  }

  type Query {
    getAllFoods(skip: Int): [Food]
    
    search(request: SearchFoodRequest!): [Food]
  }

  type Mutation {
    # This function requires token to access.
    addFood(request: FoodRequest): Food

    # The score maximize is 5.
    rateFood(foodId: String!, score: Int!): Food
  }
`

const getAllFoods = async (_, args) => {
  let { skip } = args

  let foods = await Food.find()
    .skip((skip || 0) * 10)
    .limit(10)

  return foods
}

const search = async (_, args) => {
  let { request } = args
  let { type, tags, name } = request

  var foods

  switch (type) {
    case "BY_NAME": {
      foods = await Food.find({
        name: {
          $regex: name,
          $options: 'i'
        }
      })
      break
    }
    case "BY_TAGS": {
      foods = await Food.find({ tags: { '$in': tags } })
      break
    }
  }

  return foods
}

const addFood = async (_, args) => {
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

const rateFood = async (_, args) => {
  let { foodId, score } = args

  if (score > 5) throw `Sorry, your vote is not valid.`

  let food = await Food.findOne({ _id: foodId })

  if (!food) throw `The food does not exits.`

  food.counting.push(score)

  var arrScore = food.counting

  let avg = arrScore.reduce((arrScore, i) => arrScore + i) / arrScore.length

  food.rating = lodash.round(avg, 1)

  try {
    let result = await food.save()

    return food
  } catch (error) {
    throw error
  }
}

const resolvers = {
  Query: {
    getAllFoods,
    search
  },
  Mutation: {
    addFood,
    rateFood
  }
}

const schema = makeExecutableSchema({ typeDefs, resolvers })

export default schema