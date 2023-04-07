import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Button,
  useToast,
  FormControl,
  Input,
  Spinner,
  Box,
} from "@chakra-ui/react";
import { ChatState } from "../../Context/ChatProvider";
import Axios from "axios";
import UsersListItem from "../UsersList/UsersListItem";
import UserBadgeItem from "../UsersList/UserBadgeItem.js";

const GroupChatModal = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [groupChatName, setGroupChatName] = useState(); //Contain the group chat's name before it's updated
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]); //Contain search result we get back from the API
  const [loading, setLoading] = useState(false);

  const toast = useToast();

  //After creating the new group chat, we'll append it to the list of the chats that we already have
  const { user, chats, setChats } = ChatState();

  const searchHandler = async (query) => {
    setSearch(query);

    if (!query) {
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
      //data = 'users' array returned from the backend by 'allUsers' controller

      console.log(data);
      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      toast({
        title: "Error Occured",
        description: "Failed To Fetch",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });

      setLoading(false);
    }
  };

  const addToSelectedUsers = (userToAdd) => {
    //Check if the selected user is already added to the array, if so, return
    if (selectedUsers.includes(userToAdd)) {
      toast({
        title: "User Already Added",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    //If the selected user is not added yet, add the user to the array
    setSelectedUsers([...selectedUsers, userToAdd]);
  };

  const deleteFromSelectedUsers = (userToDelete) => {
    // Filter out the user with the given id from the selectedUsers array
    const updatedUsers = selectedUsers.filter(
      (user) => user._id !== userToDelete._id
    );
    setSelectedUsers(updatedUsers);
  };

  const submitHandler = async () => {
    //Check if the group's name or selectedUsers is empty
    if (!groupChatName) {
      toast({
        title: "Please enter group's name",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    } else if (selectedUsers.length === 0) {
      toast({
        title: "Please select users",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    } else if (selectedUsers.length < 3) {
      toast({
        title: "Please select at least 3 users",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await Axios.post(
        "https://chit-chat-u1xp.onrender.com/api/chat/group",
        {
          chatName: groupChatName,
          users: JSON.stringify(selectedUsers.map((user) => user._id)),
        },
        config
      );
      console.log(data);

      //Append new group chat to the top of the existing chats list
      setChats([data, ...chats]);

      onClose();

      toast({
        title: "New Group Chat Created Successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Failed To Create New Group Chat",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  return (
    <>
      <span onClick={onOpen}>{children}</span>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize="30px"
            fontFamily="Work Sans"
            display="flex"
            justifyContent="center"
          >
            Create Group Chat
          </ModalHeader>

          <ModalCloseButton />

          <ModalBody display="flex" flexDir="column" alignItems="center">
            <FormControl>
              <Input
                placeholder="Group Chat Name"
                mb={2}
                onChange={(event) => setGroupChatName(event.target.value)}
              />
            </FormControl>

            <FormControl>
              <Input
                placeholder="Users (Eg: John, Billy,...)"
                mb={2}
                onChange={(event) => searchHandler(event.target.value)}
              />
            </FormControl>

            {/* Render Selected Users From Search Results */}
            <Box display="flex" flexWrap="wrap" w="100%">
              {selectedUsers.map((user) => {
                return (
                  <UserBadgeItem
                    key={user._id}
                    user={user}
                    handleFunction={() => deleteFromSelectedUsers(user)}
                    groupAdmin={""} //We don't need to use groupAdmin here so we set it empty to prevent "undefined" error
                  />
                );
              })}
            </Box>

            {/* Render Searched Users */}
            {loading ? (
              <Spinner />
            ) : (
              searchResult?.slice(0, 4).map((user) => {
                return (
                  <UsersListItem
                    key={user._id}
                    user={user}
                    handleFunction={() => addToSelectedUsers(user)}
                  />
                );
              })
            )}
          </ModalBody>

          <ModalFooter>
            <Button onClick={submitHandler}>Create</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default GroupChatModal;
