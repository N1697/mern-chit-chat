const getSender = (loggedUser, users) => {
  return users[0]._id === loggedUser._id ? users[1].name : users[0].name;

  //Return the other user's name (not the logged-in user) of the 1-on-1 chat
};

const getSenderInfo = (loggedUser, users) => {
  return users[0]._id === loggedUser._id ? users[1] : users[0];

  //Return the other user's info (not the logged-in user) of the 1-on-1 chat
};

const isSameSender = (messages, message, i, userID) => {
  //Return a boolean value
  return (
    i < messages.length - 1 &&
    (messages[i + 1].sender._id !== message.sender._id || //Check if the next message's sender is not the current message's sender
      messages[i + 1].sender._id === undefined) && //Check if the next message's sender is undefined
    messages[i].sender._id !== userID //Check if the current message is not sent by the logged-in user
  );
};

const isLastMessage = (messages, i, userID) => {
  //Return a boolean value indicating whether the current message is the last message of the opposite user in the chat
  return (
    i === messages.length - 1 && //Check if it's the last message of the opposite user or not
    messages[messages.length - 1].sender._id !== userID && //Check if the sender of the last message is not the logged-in user
    messages[messages.length - 1].sender._id //Check if the user of that last message exists
  );
};

const isSameSenderMargin = (messages, message, i, userID) => {
  if (
    i < messages.length - 1 && //Check if i exceeds the array
    messages[i + 1].sender._id === message.sender._id && //Check if the next message's sender is the sender of the current message
    messages[i].sender._id !== userID //Check if the current message's sender is not the logged-in user
  ) {
    //If the next message has the same sender as the current message and the current message is not sent by the logged-in user, the margin is set to 33.
    return 33;
  } else if (
    (i < messages.length - 1 &&
      messages[i + 1].sender._id !== message.sender._id &&
      messages[i].sender._id !== userID) ||
    (i === messages.length - 1 && messages[i].sender._id !== userID)
  ) {
    //If the next message has a different sender than the current message and the current message is not sent by the logged-in user
    //Or if the current message is the last message in the chat and is not sent by the logged-in user, the margin is set to 0.
    return 0;
  } else {
    //Otherwise, the margin is set to "auto", which means it will be determined automatically by the browser
    return "auto";
  }
};

const isSameUser = (messages, message, i) => {
  //Check if i > 0 and the previous message's sender is the same as the current message's sender
  return i > 0 && messages[i - 1].sender._id === message.sender._id;
};

export {
  getSender,
  getSenderInfo,
  isSameSender,
  isLastMessage,
  isSameSenderMargin,
  isSameUser,
};
