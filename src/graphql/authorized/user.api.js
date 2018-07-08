import { makeExecutableSchema } from 'graphql-tools';
import { sign, verify } from '../../utils/jwt';

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

  type Author {
    name: String
    phone: String
    email: String
    github: String!
  }

  type Query {
    renewToken(refreshToken: String!): Token

    # Get info of user.
    me: User

    about: Author
  }
`;

const renewToken = async (_, args) => {
  const { refreshToken } = args;

  console.debug(refreshToken);

  const realToken = refreshToken.replace(/Bearer /g, '').replace(/bearer /g, '');

  const payload = await verify(realToken);

  if (!payload) throw new Error('invalid token.');

  const accessToken = sign(payload, { expiresIn: '1h' });

  const newRefreshToken = sign(payload, { expiresIn: '6h' });

  return {
    accessToken,
    refreshToken: newRefreshToken,
  };
};

const me = async (_, args, context) => {
  const { user } = context;

  return user;
};

const about = () => ({
  name: 'Huynh Tran Dang Khoa',
  phone: '01229088405',
  email: 'huynhtran.dangkhoa@gmail.com',
  github: 'https://github.com/htdangkhoa',
});

const resolvers = {
  Query: {
    renewToken,
    me,
    about,
  },
};

const schema = makeExecutableSchema({ typeDefs, resolvers });

export default schema;
