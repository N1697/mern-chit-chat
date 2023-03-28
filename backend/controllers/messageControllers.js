import asyncHandler from "express-async-handler";
import Chat from "../models/chatModel.js";
import Message from "../models/messageModel.js";
import User from "../models/userModel.js";

const sendMessage = asyncHandler(async (req, res) => {
  //Required:
  //1. The id of the chat we're sending the message to
  //2. The message to be send
  //3. The sender of the message
  const { chatID, messageContent } = req.body;

  console.log(chatID, messageContent);

  //Check if chatID or message is empty
  if (!chatID || !messageContent) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  //Otherwise, create a new message
  var newMessage = {
    sender: req.user._id, //The logged-in user's id
    chat: chatID,
    content: messageContent,
  };

  try {
    // var message = await Message.create(newMessage);

    // //Populate the message
    // // message = await message.populate("sender", "name pic"); //Get the 'name' and 'pic' of the sender
    // // message = await message.populate("chat");
    // let populatedMessage = await Message.findOne({ _id: message._id })
    //   .populate("sender", "name pic")
    //   .populate("chat");

    // populatedMessage = await User.populate(populatedMessage, {
    //   path: "chat.users",
    //   select: "name pic email",
    // });

    // //Find and update the latestMessage of the chat
    // await Chat.findByIdAndUpdate(req.body.chatID, {
    //   latestMessage: populatedMessage,
    // });

    // res.json(populatedMessage);

    var message = await Message.create(newMessage);

    //Populate the message
    // message = await message.populate("sender", "name pic"); //Get the 'name' and 'pic' of the sender
    // message = await message.populate("chat");
    message = await Message.findOne({ _id: message._id })
      .populate("sender", "name pic")
      .populate("chat");

    await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    //Find and update the latestMessage of the chat
    await Chat.findByIdAndUpdate(req.body.chatID, {
      latestMessage: message,
    });

    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const allMessages = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatID })
      .populate("sender", "name pic email")
      .populate("chat");

    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

export { sendMessage, allMessages };
