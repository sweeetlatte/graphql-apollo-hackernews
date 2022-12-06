const { ApolloServer } = require("apollo-server");

/**
 * The typeDefs constant defines your GraphQL schema.
 * Here is a simple Query type with one field called info. This field has the type String!.
 * The exclamation mark in the type definition means that this field is required and can never be null.
 */
const typeDefs = `
  type Query {
    info: String!
  }
`;

/**
 * The resolvers object is the actual implementation of the GraphQL schema.
 * Notice how its structure is identical to the structure of the type definition inside typeDefs: Query.info.
 */
const resolvers = {
  Query: {
    info: () => null,
  },
};

/**
 * Finally, the schema and resolvers are bundled and passed to ApolloServer.
 * This tells the server what API operations are accepted and how they should be resolved.
 */
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen().then(({ url }) => console.log(`Server is running on ${url}`));
