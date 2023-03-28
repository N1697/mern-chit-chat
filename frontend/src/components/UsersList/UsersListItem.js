import { Avatar, Box, Text } from "@chakra-ui/react";
import React from "react";

const UsersListItem = ({ user, handleFunction }) => {
  return (
    <Box
      onClick={handleFunction}
      cursor="pointer"
      w="100%"
      display="flex"
      alignItems="center"
      borderRadius="lg"
      color="white"
      bg="black"
      px="5"
      py="2"
      mb="2"
      transition="0.25s ease"
      _hover={{
        transform: "scale(1.1)",
      }}
    >
      <Avatar
        size="sm"
        cursor="pointer"
        mr="2"
        src={user.pic}
        alt={user.name}
        name={user.name}
      />

      <Box>
        <Text>{user.name}</Text>
        <Text fontSize="xs">{user.email}</Text>
      </Box>
    </Box>
  );
};

export default UsersListItem;
