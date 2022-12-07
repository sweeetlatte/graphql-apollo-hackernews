const jwt = require("jsonwebtoken");
const APP_SECRET = "GraphQL-is-aw3some";

function getTokenPayload(token) {
  return jwt.verify(token, APP_SECRET);
}

// The getUserId function is a helper function that you’ll call in resolvers which require authentication
function getUserId(req, authToken) {
  if (req) {
    // retrieves the Authorization header (which contains the User’s JWT) from the context
    const authHeader = req.headers.authorization;

    // verifies the JWT and retrieves the User’s ID from it
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      if (!token) {
        throw new Error("No token found");
      }
      const { userId } = getTokenPayload(token);
      return userId;
    }
  } else if (authToken) {
    const { userId } = getTokenPayload(authToken);
    return userId;
  }

  throw new Error("Not authenticated");
}

module.exports = {
  APP_SECRET,
  getUserId,
};
