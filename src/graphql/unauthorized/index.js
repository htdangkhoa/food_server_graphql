import { mergeSchemas } from 'graphql-tools';
import user from './user.api';
import food from './food.api';

const schema = mergeSchemas({
  schemas: [user, food],
});

export default schema;
