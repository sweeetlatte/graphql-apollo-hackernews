const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { APP_SECRET } = require("../utils");

async function signup(parent, args, context, info) {
  // 1. encrypt the User’s password using the bcryptjs library
  const password = await bcrypt.hash(args.password, 10);

  // 2. use PrismaClient instance (via prisma) to store the new User record in the database
  const user = await context.prisma.user.create({
    data: { ...args, password },
  });

  // 3. Generate a JSON Web Token which is signed with an APP_SECRET
  const token = jwt.sign({ userId: user.id }, APP_SECRET);

  // 4. return the token and the user in an object that adheres to the shape of an AuthPayload object from GraphQL schema
  return {
    token,
    user,
  };
}

async function login(parent, args, context, info) {
  // 1. use PrismaClient instance to retrieve an existing User record by the email address that was sent along as an argument in the login mutation
  //    If no User with that email address was found => return a corresponding error
  const user = await context.prisma.user.findUnique({ where: { email: args.email } });
  console.log(user);
  
  // const user = await context.prisma.user.findUnique({
  //   where: { email: args.email },
  // });

  if (!user) {
    throw new Error("No such user found");
  }

  // 2. compare the provided password with the one that is stored in the database
  const valid = await bcrypt.compare(args.password, user.password);
  if (!valid) {
    throw new Error("Invalid password");
  }

  const token = jwt.sign({ userId: user.id }, APP_SECRET);

  // 3
  return {
    token,
    user,
  };
}

async function addLink(parent, args, context, info) {
  const { userId } = context;

  return await context.prisma.link.create({
    data: {
      url: args.url,
      description: args.description,
      postedBy: { connect: { id: userId } },
    },
  });
}

// updateLink: (_, args) => {
//   const existingLink = links.find((link) => link.id === args.id);
//   args.url && (existingLink.url = args.url);
//   args.description && (existingLink.description = args.description);
//   // await existingLink.save();
//   return existingLink;
// },
// deleteLink: (_, args) => {
//   const index = links.findIndex((link) => link.id === args.id);
//   links.splice(index, 1);
//   return links;
// },

module.exports = {
  signup,
  login,
  addLink,
};
