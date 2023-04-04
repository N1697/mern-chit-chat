import { ArrowBackIcon } from "@chakra-ui/icons";
import {
  Box,
  FormControl,
  IconButton,
  Input,
  Spinner,
  Text,
  useToast,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { ChatState } from "../Context/ChatProvider";
import { getSender, getSenderInfo } from "../config/ChatLogics";
import ProfileModal from "./Miscellaneous/ProfileModal";
import UpdateGroupChatModel from "./Miscellaneous/UpdateGroupChatModel";
import Axios from "axios";
import "./style.css";
import ScrollableChat from "./ScrollableChat";
import io from "socket.io-client";
import Lottie from "react-lottie";
import animationData from "../animations/typing.json";

const ENDPOINT = "https://chit-chat-u1xp.onrender.com"; //http://localhost:5000
var socket, selectedChatCompare;

const ChatItem = ({ fetchAgain, setFetchAgain }) => {
  const { user, selectedChat, setSelectedChat, notification, setNotification } =
    ChatState();

  const [messages, setMessages] = useState([]); //Contains all of the messages from the back-end
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const toast = useToast();

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      setLoading(true);

      const { data } = await Axios.get(
        `/api/message/${selectedChat._id}`,
        config
      );
      //data = 'messages' array sent back from the back-end
      console.log(messages);

      setMessages(data);
      setLoading(false);

      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toast({
        title: "Failed To Fetch The Messages.",
        description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));
  }, []);

  const sendMessageHandler = async (event) => {
    if (event.key === "Enter" && newMessage) {
      socket.emit("stop typing", selectedChat._id);

      try {
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };

        //Before sending the new message to the back-end, set the newMessage to empty
        setNewMessage("");
        /**
         The API request will run before the `newMessage` is set to empty.
         The `setNewMessage("")` call only affects the state of the component,
         but it does not affect the order of execution of the code.
         Therefore, the request to the back-end will be sent with the value of `newMessage` before it is set to an empty string. 
         */

        const { data } = await Axios.post(
          "/api/message",
          {
            chatID: selectedChat._id,
            messageContent: newMessage,
          },
          config
        );
        //data = 'message' sent back from the back-end

        console.log(data);

        socket.emit("new message", data);

        //Append whatever we get back from the back-end to the messages array
        setMessages([...messages, data]);
      } catch (error) {
        toast({
          title: "Failed To Send The Message.",
          description: error.response.data.message,
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  };

  const typingHandler = (event) => {
    //When the user's typing, set the value of the input to the newMessage
    setNewMessage(event.target.value);

    //Check if the socket is not connected
    if (!socketConnected) return;

    //If the socket is connected, set the typing state to true
    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }

    //Stop the typing after 3s since the last time the user was typing
    const lastTypingTime = new Date().getTime();
    const elapsedTime = 3000;

    setTimeout(() => {
      const currentTime = new Date().getTime();
      const diffInTime = currentTime - lastTypingTime;

      if (diffInTime >= elapsedTime && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, elapsedTime);
  };

  useEffect(() => {
    fetchMessages();

    selectedChatCompare = selectedChat;
    //Keep a backup of whatever the 'selectedChat' state is inside 'selectedChatCompare' so that we can compare it
    //to decide if we should emit the message or give the notification to the user
  }, [selectedChat]);

  useEffect(() => {
    socket.on("message recieved", (newMessage) => {
      //Check if none of the chat is selected or the chat that is selected doesn't match the chat where the newMessage belongs to
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessage.chat._id
      ) {
        //Give a notification:

        //If the notification does not have the newMessage, add the newMessage to it
        if (!notification.includes(newMessage)) {
          setNotification([newMessage, ...notification]);

          //Then fetch the chat again
          setFetchAgain(!fetchAgain); //When a state change, React triggers a re-render => The chat will be fetch again
        }
      } else {
        //Append the newMessage to the 'messages' array
        setMessages([...messages, newMessage]);
      }
    });
  });

  return (
    <>
      {selectedChat ? (
        <>
          <Text
            display="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
            fontFamily="Work Sans"
            w="100%"
          >
            <IconButton
              display={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            />

            {selectedChat.isGroupChat ? (
              <>
                {/* Render Group Chat's Name */}
                {selectedChat.chatName.toUpperCase()}

                {/* Render Group Chat Modal */}
                <UpdateGroupChatModel
                  fetchAgain={fetchAgain}
                  setFetchAgain={setFetchAgain}
                  fetchMessages={fetchMessages}
                />
              </>
            ) : (
              <>
                {/* Render User's Name */}
                {getSender(user, selectedChat.users)}

                {/* Render User Modal */}
                <ProfileModal user={getSenderInfo(user, selectedChat.users)} />
              </>
            )}
          </Text>

          <Box
            display="flex"
            flexDir="column"
            justifyContent="flex-end"
            w="100%"
            h="100%"
            color="white"
            bg="#242526"
            p={2}
            mt={2}
            borderRadius="lg"
            overflowY="hidden"
          >
            {loading ? (
              <Spinner size="xl" alignSelf="center" margin="auto" />
            ) : (
              // Container for all of the messages
              <div className="messages">
                <ScrollableChat messages={messages} />
              </div>
            )}

            <FormControl onKeyDown={sendMessageHandler} isRequired>
              {isTyping ? (
                <div>
                  <Lottie
                    options={defaultOptions}
                    width={50}
                    height={50}
                    style={{ marginLeft: 0 }}
                  />
                </div>
              ) : (
                <></>
              )}
              <Input
                placeholder="Type a message..."
                bg="#3a3b3c"
                variant="filled"
                focusBorderColor="white"
                mt="10px"
                value={newMessage}
                onChange={typingHandler}
              />
            </FormControl>
          </Box>
        </>
      ) : (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          h="100%"
        >
          <Text fontSize="2xl" fontFamily="Work Sans">
            Select a user to chit-chat with
          </Text>
        </Box>
      )}
    </>
  );
};

export default ChatItem;
