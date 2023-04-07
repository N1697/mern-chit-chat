import { Button, useToast } from "@chakra-ui/react";
import { Box, Stack, Text } from "@chakra-ui/layout";
import Axios from "axios";
import React, { useEffect, useState } from "react";
import { ChatState } from "../Context/ChatProvider";
import { AddIcon } from "@chakra-ui/icons";
import ChatLoading from "./ChatLoading";
import { getSender } from "../config/ChatLogics";
import GroupChatModal from "./Miscellaneous/GroupChatModal";

//When the user comes to this page, it's supposed to fetch all of the chats of the user
const MyChats = ({ fetchAgain }) => {
  const { user, setUser, selectedChat, setSelectedChat, chats, setChats } =
    ChatState();

  const [loggedUser, setLoggedUser] = useState();
  const toast = useToast();

  const fetchChats = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await Axios.get(
        "https://chit-chat-u1xp.onrender.com/api/chat",
        config
      );
      //data = "chats" returned from backend
      console.log(data);
      setChats(data);
    } catch (error) {
      toast({
        title: "Failed to Fetch",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChats();
  }, [fetchAgain]);

  return (
    <Box
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      alignItems="center"
      p="3px"
      bg="white"
      w={{ base: "100%", md: "30%" }}
      borderRadius="lg"
      borderWidth="1px"
    >
      {/* Header: My Chats , New Group Chat button */}
      <Box
        pb="2px"
        px="5px"
        fontSize={{ base: "28px", md: "30px" }}
        fontFamily="Work Sans"
        display="flex"
        w="100%"
        justifyContent="space-between"
        alignItems="center"
      >
        All Chats
        <GroupChatModal>
          <Button
            display="flex"
            fontSize={{ base: "16px", md: "12px", lg: "16px" }}
            rightIcon={<AddIcon />}
          >
            New Group Chat
          </Button>
        </GroupChatModal>
      </Box>

      {/* Container for all of the chats */}
      <Box
        display="flex"
        flexDir="column"
        p="5px"
        bg="#F8F8F8"
        w="100%"
        h="100%"
        borderRadius="lg"
        overflowY="hidden"
      >
        {chats ? (
          <Stack overflowY="scroll">
            {chats.map((chat) => {
              return (
                <Box
                  onClick={() => setSelectedChat(chat)}
                  cursor="pointer"
                  color={chat === selectedChat ? "white" : "black"}
                  bg={chat === selectedChat ? "black" : "#E8E8E8"}
                  w="100%"
                  px="5"
                  py="2"
                  borderRadius="lg"
                  transition="0.25s ease"
                  key={chat._id}
                >
                  <Text>
                    {chat.isGroupChat
                      ? chat.chatName
                      : getSender(loggedUser, chat.users)}
                  </Text>
                </Box>
              );
            })}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  );
};

export default MyChats;
