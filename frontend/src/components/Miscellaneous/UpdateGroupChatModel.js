import {
  Box,
  Button,
  FormControl,
  IconButton,
  Input,
  Spinner,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import { ViewIcon } from "@chakra-ui/icons";
import { ChatState } from "../../Context/ChatProvider";
import UserBadgeItem from "../UsersList/UserBadgeItem";
import Axios from "axios";
import UsersListItem from "../UsersList/UsersListItem";

const UpdateGroupChatModel = ({ fetchAgain, setFetchAgain, fetchMessages }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [groupChatName, setGroupChatName] = useState(""); //Contain the group chat's name before it's updated
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]); //Contain search result we get back from the API
  const [loading, setLoading] = useState(false);
  const [renameLoading, setRenameLoading] = useState(false);

  const toast = useToast();

  const { user, selectedChat, setSelectedChat } = ChatState();

  const renameHandler = async () => {
    if (!groupChatName) {
      toast({
        title: "Please enter a name",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    try {
      setRenameLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await Axios.put(
        "/api/chat/rename",
        {
          chatID: selectedChat._id,
          newName: groupChatName,
        },
        config
      );
      //"data" is the updated group chat that is renamed

      toast({
        title: "Successfully Renamed",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });

      setSelectedChat(data); //Set the selected chat to the renamed group chat
      setFetchAgain(!fetchAgain); //Trigger a re-render
      setRenameLoading(false);
    } catch (error) {
      toast({
        title: "Failed to Rename",
        description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setRenameLoading(false);
    }
    setGroupChatName("");
  };

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

      const { data } = await Axios.get(`/api/user?search=${search}`, config);
      //data = 'users' array returned from the backend by 'allUsers' controller
      //search = user name/email

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

  const addUsersHandler = async (userToAdd) => {
    //Check if the selected user is already in the group chat
    if (selectedChat.users.find((user) => user._id === userToAdd._id)) {
      toast({
        title: "Selected user already exists.",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    //Check if the logged-in user is the addmin of the group
    if (user._id !== selectedChat.groupAdmin._id) {
      toast({
        title: "You are not the admin.",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
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

      const { data } = await Axios.put(
        "/api/chat/add",
        {
          userID: userToAdd._id,
          chatID: selectedChat._id,
        },
        config
      );
      //data is the updated group chat with the new user added

      setSelectedChat(data);
      setFetchAgain(!fetchAgain); //Trigger a re-render
      setLoading(false);
    } catch (error) {
      toast({
        title: "Failed to Add User.",
        description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
  };

  const removeHandler = async (userToRemove) => {
    //Check if the logged-in user is the admin and check if the logged-in user is the user to be removed
    if (
      user._id !== selectedChat.groupAdmin._id &&
      user._id !== userToRemove._id
    ) {
      toast({
        title: "You are not the admin.",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
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

      const { data } = await Axios.put(
        "/api/chat/remove",
        {
          userID: userToRemove._id,
          chatID: selectedChat._id,
        },
        config
      );
      //data is the updated group chat without the removed user

      //Check if the logged-in user removed himself
      //If so, set the selected chat to empty so that the user does not see the chat anymore
      //Else, set the selected chat to the updated group chat
      user._id === userToRemove._id ? setSelectedChat() : setSelectedChat(data);
      setFetchAgain(!fetchAgain); //Trigger a re-render
      fetchMessages();
      setLoading(false);
    } catch (error) {
      toast({
        title: "Failed to Remove User.",
        description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
  };

  return (
    <>
      <IconButton
        icon={<ViewIcon />}
        onClick={onOpen}
        display={{ base: "flex" }}
        borderRadius="full"
      />

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            display="flex"
            justifyContent="center"
            fontSize="25px"
            fontFamily="Work Sans"
          >
            {selectedChat.chatName}
          </ModalHeader>

          <ModalCloseButton />

          <ModalBody>
            <Box display="flex" flexWrap="wrap">
              {selectedChat.users.map((user) => {
                return (
                  <UserBadgeItem
                    key={user._id}
                    user={user}
                    handleFunction={() => removeHandler(user)}
                    groupAdmin={selectedChat.groupAdmin}
                  />
                );
              })}
            </Box>

            {/* Form to Update Group Chat Name */}
            <FormControl display="flex">
              <Input
                placeholder="Update Group's Name"
                mb={1}
                borderRightRadius="0"
                value={groupChatName}
                onChange={(event) => setGroupChatName(event.target.value)}
              />

              <Button
                variant="outline"
                colorScheme="blue"
                color="black"
                borderColor="black"
                borderLeftRadius="0"
                isLoading={renameLoading}
                onClick={renameHandler}
              >
                Update
              </Button>
            </FormControl>

            {/* Form to Add Users To Group */}
            <FormControl display="flex" gap="1px">
              <Input
                placeholder="Add Users"
                mb={2}
                onChange={(event) => searchHandler(event.target.value)}
              />
            </FormControl>

            {/* Render Searched Users */}
            <Box display="flex" flexDir="column" alignItems="center">
              {loading ? (
                <Spinner size="lg" />
              ) : (
                searchResult?.slice(0, 4).map((user) => {
                  return (
                    <UsersListItem
                      key={user._id}
                      user={user}
                      handleFunction={() => addUsersHandler(user)}
                    />
                  );
                })
              )}
            </Box>
          </ModalBody>

          <ModalFooter>
            <Button
              variant="outline"
              colorScheme="red"
              onClick={() => removeHandler(user)}
            >
              Leave Group
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default UpdateGroupChatModel;
