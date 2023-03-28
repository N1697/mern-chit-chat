import { Box } from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";
import React from "react";

const UserBadgeItem = ({ user, handleFunction, groupAdmin }) => {
  return (
    <Box
      px={2}
      py={1}
      m={1}
      mb={2}
      borderRadius="lg"
      variant="solid"
      fontSize={12}
      color={user._id === groupAdmin._id ? "white" : "black"}
      background={user._id === groupAdmin._id ? "black" : "#E8E8E8"}
      cursor="pointer"
      onClick={handleFunction}
    >
      {user.name}
      <CloseIcon pl={1} />
    </Box>
  );
};

export default UserBadgeItem;
