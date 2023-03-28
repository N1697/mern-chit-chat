import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import asyncHandler from "express-async-handler";

//For any protected routes that require authentication, we add middleware to the route that checks for the token in the incoming request header.
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    //The authorization header is used to send authentication information to the server, it contains the credentials of the user or client that is making the request
    //Check if the request header contains an Authorization field and if the value of the Authorization field starts with the string "Bearer"
    //Check if the client has sent a valid bearer token with the request header, which is needed for certain routes that require authentication
    //The header is expected to be in the form of a Bearer token
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      //Extract the token from the authorization header of the HTTP request
      //The split() function is used to split the authorization header into an array, using a space (" ") as the separator
      //This will create an array with two elements, where the first element is the string "Bearer" and the second element is the actual token
      //A Bearer token is usually formatted as a string that begins with the word "Bearer", followed by a space, and then the token itself
      //Ex: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c

      //If the token is valid, we extract the user ID from the token payload
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY); //jwt.verify(token, secretKey);
      /**
       The decoded payload contains the claims of the JWT, such as the subject, issuer, expiration time,
       and any custom claims that were included when the JWT was created
       The decoded payload contains the data that was originally encoded into the JWT when it was created, such as the user's ID or email,
       in this case the payload contains the id field
       */

      req.user = await User.findById(decoded.id).select("-password");
      //The result returned by User.findById(decoded.id).select("-password") would be a User document with all fields except the password field

      next();
    } catch (error) {
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

export default protect;
