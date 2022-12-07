const { ApolloServer } = require("apollo-server");
const fs = require("fs");
const path = require("path");

/**
 * The typeDefs constant defines your GraphQL schema.
 */

let links = [
  {
    id: "link-0",
    url: "https://www.allrecipes.com/recipe/266826/air-fryer-potato-wedges/",
    description: "Air Fryer Potato Wedges",
  },
  {
    id: "link-1",
    url: "https://www.allrecipes.com/recipe/8508938/loaded-chicken-and-potato-casserole/",
    description: "Loaded Chicken and Potato Casserole",
  },
  {
    id: "link-2",
    url: "https://www.allrecipes.com/recipe/13811/watergate-salad/",
    description: "Watergate Salad",
  },
];

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
const resolvers = {
  Query: {
    info: () => `This is the API of a Hackernews Clone`,
    feed: () => links,
    link: (_, args) => {
      return links.find((link) => link.id === args.id);
    },
  },

  Mutation: {
    addLink: (_, args) => {
      let idCount = links.length;

      const link = {
        id: `link-${idCount++}`,
        description: args.description,
        url: args.url,
      };

      links.push(link);

      return link;
    },

    updateLink: (_, args) => {
      const existingLink = links.find((link) => link.id === args.id);

      if (args.url) existingLink.url = args.url;
      if (args.description) existingLink.description = args.description;

      // await existingLink.save();

      return { ...existingLink };
    },

    deleteLink: (_, args) => {
      const index = links.findIndex((link) => link.id === args.id);

      links.splice(index, 1);

      return links;
    },
  },
};

/**
 * Finally, the schema and resolvers are bundled and passed to ApolloServer.
 * This tells the server what API operations are accepted and how they should be resolved.
 */
const server = new ApolloServer({
  typeDefs: readFileSync(join(__dirname, "schema.graphql"), "utf8"),
  resolvers,
});

server.listen().then(({ url }) => console.log(`Server is running on ${url}`));
