import { makeExecutableSchema } from 'graphql-tools';
import Food from '../../models/food.model';

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
`;

const getAllFoods = async (_, args) => {
  const { skip } = args;

  const foods = await Food.find()
    .skip((skip || 0) * 10)
    .limit(10);

  return foods;
};

const search = async (_, args) => {
  const { request } = args;
  const { type, tags, name } = request;

  let foods;

  switch (type) {
    case 'BY_NAME': {
      foods = await Food.find({
        name: {
          $regex: name,
          $options: 'i',
        },
      });
      break;
    }
    default: {
      foods = await Food.find({ tags: { $in: tags } });
      break;
    }
  }

  return foods;
};

const resolvers = {
  Query: {
    getAllFoods,
    search,
  },
};

const schema = makeExecutableSchema({ typeDefs, resolvers });

export default schema;
