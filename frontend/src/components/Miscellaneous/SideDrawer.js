import { Box, Text } from "@chakra-ui/layout";
import {
  Avatar,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Input,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Spinner,
  Tooltip,
  useToast,
} from "@chakra-ui/react";
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { useDisclosure } from "@chakra-ui/hooks";
import React, { useState } from "react";
import { ChatState } from "../../Context/ChatProvider";
import ProfileModal from "./ProfileModal";
import { useHistory } from "react-router-dom";
import Axios from "axios";
import ChatLoading from "../ChatLoading";
import UsersListItem from "../UsersList/UsersListItem";
import { getSender } from "../../config/ChatLogics";
import { Effect } from "react-notification-badge";
import NotificationBadge from "react-notification-badge";

const SideDrawer = () => {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);

  const {
    user,
    setSelectedChat,
    chats,
    setChats,
    notification,
    setNotification,
  } = ChatState();
  const history = useHistory();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    history.push("/");
  };

  const searchHandler = async () => {
    if (!search) {
      toast({
        title: "Please enter user's name/email",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
      return;
    }

    try {
      setLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await Axios.get(
        `https://chit-chat-u1xp.onrender.com/api/user?search=${search}`,
        config
      );
      //data = 'users' - an array returned from backend

      setLoading(false);

      // setSearch("");
      setSearchResult(data);
    } catch (error) {
      toast({
        title: "Error Occurs",
        description: "Failed to load the Search Result",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const accessChat = async (userID) => {
    try {
      setLoadingChat(true);

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await Axios.post(
        "https://chit-chat-u1xp.onrender.com/api/chat",
        { userID },
        config
      );
      //userID will be used in accessChat() controller in chatController.js
      //config will be used in protected() authMiddleware
      //data = "FullChat" that is returned from backend

      //If the "chats" state has some chats inside of it already (fetching from MyChats.js)
      //We'll append it
      if (!chats.find((chat) => chat._id === data._id)) {
        setChats([...chats, data]);

        /*
        Here, chats.find((chat) => chat._id === data._id) is using the find array method to search for
        an object in the chats array whose _id property matches the _id property of the data object.
        If no match is found, chats.find() returns undefined, and !undefined evaluates to true, meaning that
        the condition if (!chats.find((chat) => chat._id === data._id)) is true.

        If the condition is true, the setChats([...chats, data]) code is executed.
        This code creates a new array by spreading the current chats state and appending the data object to the end of the new array.
        The setChats function then updates the chats state with the new array, which now includes the data object.
        */
      }
      setSelectedChat(data);
      setLoading(false);
      onClose();
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

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        color="#b0b3b8"
        bg="black"
        w="100%"
        p="3px 10px 3px 10px"
        borderBottom="1px solid #b0b3b8"
      >
        <Tooltip
          label="Find Users to Chit-Chat"
          hasArrow
          placement="bottom-end"
        >
          <Button
            variant="ghost"
            bg="#3a3b3c"
            borderRadius="full"
            _hover={{}}
            _active={{ color: "white" }}
            onClick={onOpen}
          >
            <i className="fa-solid fa-magnifying-glass"></i>
            <Text display={{ base: "none", md: "flex" }} px="4">
              Search Users
            </Text>
          </Button>
        </Tooltip>
        <Text fontSize="2xl" fontFamily="Work Sans" fontWeight="extrabold">
          Chit-Chat
        </Text>

        <div>
          <Menu>
            <MenuButton
              p={1}
              mx="2"
              bg="#3a3b3c"
              borderRadius="full"
              _hover={{ bg: "#4e4f50" }}
              _active={{ color: "#2e89ff", bg: "#263951" }}
            >
              <NotificationBadge
                count={notification.length}
                effect={Effect.SCALE}
              />
              <BellIcon fontSize="2xl" m="1" color="#e4e6eb" />
            </MenuButton>

            <MenuList bg="#242526">
              <MenuItem bg="#242526" display="flex" flexDir="column">
                {!notification.length
                  ? "New Messages: 0"
                  : notification.map((notif) => {
                      return (
                        <MenuItem
                          key={notif._id}
                          bg="#242526"
                          _hover={{ bg: "#3a3b3c" }}
                          onClick={() => {
                            setSelectedChat(notif.chat);
                            setNotification(
                              notification.filter((n) => n !== notif) //Return the other notifications, except for notif
                            );
                          }}
                        >
                          {
                            notif.chat.isGroupChat
                              ? `New Message From [${notif.chat.chatName}]` //Group Chat
                              : `New Message From [${getSender(
                                  user,
                                  notif.chat.users
                                )}]` //1-on-1 Chat
                          }
                        </MenuItem>
                      );
                    })}
              </MenuItem>
            </MenuList>
          </Menu>

          <Menu>
            <MenuButton
              as={Button}
              rightIcon={<ChevronDownIcon />}
              borderRadius="full"
              bg="#3a3b3c"
              _hover={{ bg: "#4e4f50" }}
              _active={{ color: "#2e89ff", bg: "#263951" }}
            >
              <Avatar
                size="sm"
                cursor="pointer"
                name={user.name}
                src={user.pic}
              />
            </MenuButton>

            <MenuList bg="#242526">
              <ProfileModal user={user}>
                <MenuItem bg="#242526" _hover={{ bg: "#3a3b3c" }}>
                  Profile
                </MenuItem>
              </ProfileModal>

              <MenuDivider></MenuDivider>
              <MenuItem
                bg="#242526"
                _hover={{ bg: "#3a3b3c" }}
                onClick={logoutHandler}
              >
                Logout
              </MenuItem>
            </MenuList>
          </Menu>
        </div>
      </Box>

      <Drawer placement="left" isOpen={isOpen} onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent bg="#b0b3b8">
          <DrawerHeader borderBottomWidth="1px">
            Let's chit-chat with...
          </DrawerHeader>

          <DrawerBody>
            <Box display="flex" mb="2">
              <Input
                placeholder="User's name/email"
                mr="2"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <Button onClick={searchHandler}>
                <i className="fa-solid fa-magnifying-glass"></i>
              </Button>
            </Box>

            {loading ? (
              <ChatLoading />
            ) : (
              searchResult?.map((user) => {
                return (
                  <UsersListItem
                    key={user._id}
                    user={user}
                    handleFunction={() => accessChat(user._id)}
                  />
                );
              })
            )}

            {loadingChat && <Spinner ml="auto" display="flex" />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default SideDrawer;
