const { ApolloServer } = require("apollo-server");
const fs = require("fs");
const { join } = require("path");
const { PrismaClient } = require("@prisma/client");
const { PubSub } = require("apollo-server");

const { getUserId } = require("./utils");
const Query = require("./resolvers/Query");
const Mutation = require("./resolvers/Mutation");
const User = require("./resolvers/User");
const Link = require("./resolvers/Link");
const Subscription = require("./resolvers/Subscription");

/**
 * The typeDefs constant defines your GraphQL schema.
 */

/**
 * The resolvers object is the actual implementation of the GraphQL schema.
 * Notice how its structure is identical to the structure of the type definition inside typeDefs: Query.info.
 */

/**
 * Every GraphQL resolver function actually receives four input arguments: parent, args, contextValue, info
 * The first argument, commonly called parent (or sometimes root) is the result of the previous resolver execution level.
 *
 * The query:
 * query {
 *  feed {
 *      id
 *      url
 *      description
 *  }
 * }
 * has two of these execution levels.
 *
 * On the first level, it invokes the feed resolver and returns the entire data stored in links.
 * For the second execution level, the GraphQL server invokes the resolvers of the Link type
 * (because thanks to the schema, it knows that feed returns a list of Link elements)
 * for each element inside the list that was returned on the previous resolver level.
 *
 * Therefore, in all of the three Link resolvers, the incoming parent object is the element inside the links list.
 */
const prisma = new PrismaClient();
const pubsub = new PubSub();

const resolvers = {
  Query,
  Mutation,
  User,
  Link,
  Subscription,
};

/**
 * Finally, the schema and resolvers are bundled and passed to ApolloServer.
 * This tells the server what API operations are accepted and how they should be resolved.
 */
const server = new ApolloServer({
  typeDefs: fs.readFileSync(join(__dirname, "schema.graphql"), "utf8"),
  resolvers,
  // Instead of attaching an object directly, you’re now creating the context as a function which returns the context
  // The advantage of this approach is that you can attach the HTTP request that carries the incoming GraphQL query (or mutation) to the context as well
  // This will allow your resolvers to read the Authorization header
  // and validate if the user who submitted the request is eligible to perform the requested operation
  context: ({ req }) => {
    return {
      ...req,
      prisma,
      pubsub,
      userId: req && req.headers.authorization ? getUserId(req) : null,
    };
  },
});

server.listen().then(({ url }) => console.log(`Server is running on ${url}`));
