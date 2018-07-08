import { makeExecutableSchema } from 'graphql-tools';
import { sign, verify } from '../../utils/jwt';
import User from '../../models/user.model';

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

    about: Author
  }

  type Mutation {
    # This function requires email & password.
    registerUser(request: UserRegisterRequest): User
  }
`;

const login = async (_, args) => {
  const { email, password } = args.request;

  const user = await User.findOne({ email });

  if (!user) throw new Error('Email or password is not correct.');

  return new Promise((resolve, reject) => {
    user.comparePassword(password, (error, isMatch) => {
      if (error) throw error;

      if (!isMatch) return reject(new Error('Email or password is not correct.'));

      const accessToken = sign(user, { expiresIn: '1h' });

      const refreshToken = sign(user, { expiresIn: '6h' });

      return resolve({ accessToken, refreshToken });
    });
  });
};

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

const about = () => ({
  name: 'Huynh Tran Dang Khoa',
  phone: '01229088405',
  email: 'huynhtran.dangkhoa@gmail.com',
  github: 'https://github.com/htdangkhoa',
});

const registerUser = async (_, args) => {
  const { request } = args;

  const user = new User(request);

  try {
    await user.save();

    return user;
  } catch (error) {
    throw error;
  }
};

const resolvers = {
  Query: {
    login,
    renewToken,
    about,
  },
  Mutation: {
    registerUser,
  },
};

const schema = makeExecutableSchema({ typeDefs, resolvers });

export default schema;
