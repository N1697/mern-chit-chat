import asyncHandler from "express-async-handler";
import generateToken from "../config/generateToken.js";
import User from "../models/userModel.js";

const registerUser = asyncHandler(async (req, res) => {
  //Step 1: Get user information from the frontend
  const { name, password, email, pic } = req.body;

  //Step 2: Check if any of the information is undefined (pic is optional), if so, throw an error
  if (!name || !password || !email) {
    res.status(400); //400: Bad Request
    throw new Error("Please fill up all the fields");
  }

  //Step 3: Check if the user already exists in the database
  const userExists = await User.findOne({ email }); //Return a single document or null; We use 'email' here because it's set "unique: true" in 'userModel'

  //If the user already exists, throw an error
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  //If the user does not exist, create a new one
  const user = await User.create({
    name: name,
    password: password,
    email: email,
    pic: pic,
  });

  //Set status code to 201 (Successfully Created) if user is created and send user information back to frontend
  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      //When a new user is registerd, create a JWT (JSON Web Token) and send it along with user info to frontend
      /**
       JWT provides a way to authenticate and authorize a user by creating a secure token that contains information about the user.
       When a user logs in, their identity is verified and they are issued a JWT.
       This token can then be sent to the server with each subsequent request to authenticate and authorize the user.
       The server can decode the JWT to access the user's information and determine if they are authorized to access a particular resource or perform a specific action.
       */
      token: generateToken(user._id),
    });
  } else {
    res.status(500); //500 Internal Error
    throw new Error("Failed to create the user");
  }
});

const authUser = asyncHandler(async (req, res) => {
  //Step 1: Get user information from the frontend
  const { email, password } = req.body;

  //Step 2: Check if the user already exists in the database and if the password matches the password in the database
  const user = await User.findOne({ email });

  //If the user exists and password matches, send the user info back to the frontend
  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(401); //The client request has not been completed because it lacks valid authentication credentials for the requested resource
    throw new Error("Invalid email or password");
  }
});

const allUsers = asyncHandler(async (req, res) => {
  //There are 2 ways to send the data to the backend:
  //1. Send it through the body of 'req' by using post request
  //2. Send it using query: /api/user?search=userName (search: a variable)

  //Check if there's anything inside of query, we're gonna search the user's name and email
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],

        //The "$or" operator performs a logical OR operation on an array of two or more expressions and selects the documents that satisfy at least one of the expression
        //We're either searching inside of the name or the email, if any of these queries match, return it
        //$regex: Provides regular expression capabilities for pattern matching strings in queries (https://www.mongodb.com/docs/manual/reference/operator/query/regex/)
        //$options: "i" : case sensitive (https://www.mongodb.com/docs/manual/reference/operator/query/regex/)
      }
    : {};

  //Find all the users that match the given keyword excepts for the user that's logging in
  /**
    If a user is logged in and is searching for other users, they should not be able to see their own account in the search results.
    This is because the user already knows about their own account and should not need to search for it.
    Additionally, if the currently logged-in user's account was included in the search results, it could potentially expose
    sensitive information to the user that they should not have access to. For example, if the user is an admin and has access to more information
    than a regular user, including their own account in the search results could expose sensitive information about other users that the admin should not have access to.
  */
  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  //To get 'req.user._id', we have to authorize the user that's logged in, so we need the user to log in to provide us the JWT

  res.send(users);

  /**Here's how the code works:
  - It defines an asynchronous function allUsers using the asyncHandler middleware to handle any errors that occur during execution of the function.
  - It checks if there's any search query in the request using req.query.search. If there is, it creates a keyword object that will be used to search for users
    in the MongoDB database. The $or operator is used to search for users whose name or email matches the search query, and the $regex operator is used for pattern matching.
  - If there's no search query, an empty object is assigned to keyword.
  - It uses the User.find() method to search for all users in the database that match the keyword object, except for the currently logged-in user (req.user._id),
    which is excluded using the $ne (not equal) operator. The User.find() method returns a query object, which is then executed by calling await again to get the actual list of users.
  - The list of users is then sent back as a response to the client using the res.send() method. 
  */
});

export { registerUser, authUser, allUsers };
