import asyncHandler from "express-async-handler";
import Chat from "../models/chatModel.js";
import User from "../models/userModel.js";

const accessChat = asyncHandler(async (req, res) => {
  //This route's for creating/fetching 1-on-1 chat

  //This is the user ID of the user with whom the logged-in user wants to create a 1-on-1 chat
  const { userID } = req.body;

  //Check if the userID is provided in the request body. If not, log an error message and send a 400 Bad Request response.
  if (!userID) {
    console.log("UserID param not found in request");
    return res.sendStatus(400);
  }

  //Use the Chat model to find if the chat between the logged-in user and the user with the given userID already exists
  var isChat = await Chat.find({
    //Find the chat that has: isGroupChat property is false; both the logged-in user and the other user
    isGroupChat: false, //The isGroupChat property is set to false to find a 1-on-1 chat
    $and: [
      //Use the $and operator to specify that both the logged-in user's ID and the userID must be present in the users array of the chat
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userID } } },
    ],
  }) /*Return ObjectIds
      Ex:
      "users": [
        "64072f800c49dd1df85d7b5b",
        "6407719022dbda6f1828f681"
      ],
  */
    .populate("users", "-password")
    .populate("latestMessage"); /*
    Return the actual Objects
    Ex:
    "users": [
        {
            "_id": "64072f800c49dd1df85d7b5b",
            "name": "lequangnghi97",
            "email": "lequangnghi97@gmail.com",
            "pic": "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
            "__v": 0
        },
        {
            "_id": "6407719022dbda6f1828f681",
            "name": "Newt",
            "email": "lequangnghi16797@gmail.com",
            "pic": "http://res.cloudinary.com/dnrkukyca/image/upload/v1678209421/gvdh3pt9nga2ro6nolu2.jpg",
            "__v": 0
        }
    ],
    */

  //Retrieve the name, profile picture, and email of the user who sent the latest message in the chat.
  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
    /**
      The isChat variable holds an array of chat objects. Each chat object has a field called latestMessage, which is an object ID referencing a message object.
      The populate function is used to replace the object ID with the actual message object.
      The populate function is called on the User model, which is the model that the Chat model is referring to through the users field.
      The path parameter in the populate function specifies the field that needs to be populated, which is latestMessage.sender.
      Here, latestMessage is the name of the field in the chat object that contains the object ID referencing the message object,
      and sender is the field in the message object that needs to be populated.
      The select parameter in the populate function specifies which fields from the populated object need to be returned.
      In this case, the name, pic, and email fields of the sender object are returned.
      After the populate function is called, the isChat array will contain the chat objects with the latestMessage field replaced by the message object and
      the sender field of the message object populated with the specified fields. This is useful when we want to display additional information about the sender of the latest message in the chat list.
      */
  });

  //Check if the chat between the two users already exists, send the first chat document found as the response, return it.
  //Else, create a new chat document with the logged-in user's ID and the given userID.
  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userID],
    };

    try {
      const createdChat = await Chat.create(chatData);

      //Retrieve the created chat document, and populate the user information of the chat
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );

      res.status(200).json(FullChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
});

const fetchChats = asyncHandler(async (req, res) => {
  try {
    //Inside all of the chats, we'll search and return the chat that has the users array in which the logged-in user is a part of
    //Then populate all of the things that returned (users, groupAdmin, latestMessage) and sort all of the chats from new to old chats
    //If a chat is a group chat, it has a groupAdmin field
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password") //Populate the users field of each chat with the corresponding user documents from the User collection
      .populate("groupAdmin", "-password") //Populate the groupAdmin field of any group chats with the corresponding user documents from the User collection
      .populate("latestMessage") //Populate the latestMessage field of each chat with the corresponding message document
      .sort({ updatedAt: -1 }) //-1: descending order
      .then(async (chats) => {
        chats = await User.populate(chats, {
          path: "latestMessage.sender",
          select: "name pic email",
        });

        res.status(200).send(chats);
      });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const createGroupChat = asyncHandler(async (req, res) => {
  //The frontend will send the chatName and a list of selected users along with the logged-in user to the backend

  //First, check if chatName and users are empty
  if (!req.body.chatName || !req.body.users) {
    return res.status(400).send({ message: "Please fill up the fields" });
  }

  //If we have both chatName and users, we'll take the users and parse it
  var users = JSON.parse(req.body.users);

  //A group chat should have more than 2 users
  if (users.length < 2) {
    return res.status(400).send("Please select more than 2 users");
  }

  //The logged-in user who is creating the group chat should be included to the group chat which is the users array
  users.push(req.user);

  try {
    const groupChat = await Chat.create({
      chatName: req.body.chatName,
      isGroupChat: true,
      users: users,
      groupAdmin: req.user,
    });

    //Fetch the groupChat from database to find the groupChat created just now by using its id property and send it back to the frontend
    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const renameGroupChat = asyncHandler(async (req, res) => {
  //When the frontend selects a chat to rename, we'll take the id and newName of that chat
  const { chatID, newName } = req.body;

  //Find the chat in the database with them same id and name to update it
  const updatedChat = await Chat.findByIdAndUpdate(
    chatID,
    {
      chatName: newName,
    },
    {
      new: true, //The 'new: true' option is used to return the updated document, rather than the original document before the update.
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  //Check if the updatedChat is empty or null, throw error. Else, send the updatedChat to frontend
  if (!updatedChat) {
    res.status(404);
    throw new Error("404: Chat Not Found");
  } else {
    res.status(200).json(updatedChat);
  }
});

const removeFromGroupChat = asyncHandler(async (req, res) => {
  //We need the userID we want to remove from the group and the chatID of the group we want to remove the user from
  const { userID, chatID } = req.body;

  //Find the chat we want to remove the user from with the chatID
  const updatedChat = await Chat.findByIdAndUpdate(
    chatID,
    {
      $pull: { users: userID },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  //Check if the updatedChat is empty or null, throw error. Else, send the updatedChat to frontend
  if (!updatedChat) {
    res.status(404);
    throw new Error("404: Chat Not Found");
  } else {
    res.json(updatedChat);
  }
});

const addToGroupChat = asyncHandler(async (req, res) => {
  //We need the userID we want to add to the group and the chatID of the group we want to add the user to
  const { userID, chatID } = req.body;

  //Find the chat we want to add the user to with the chatID
  const updatedChat = await Chat.findByIdAndUpdate(
    chatID,
    {
      $push: { users: userID },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  //Check if the updatedChat is empty or null, throw error. Else, send the updatedChat to frontend
  if (!updatedChat) {
    res.status(404);
    throw new Error("404: Chat Not Found");
  } else {
    res.json(updatedChat);
  }
});

export {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroupChat,
  removeFromGroupChat,
  addToGroupChat,
};
