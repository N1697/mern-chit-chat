import { Avatar, Tooltip } from "@chakra-ui/react";
import React from "react";
import ScrollableFeed from "react-scrollable-feed";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../config/ChatLogics";
import { ChatState } from "../Context/ChatProvider";

const ScrollableChat = ({ messages }) => {
  const { user } = ChatState();
  return (
    <ScrollableFeed>
      {messages &&
        messages.map((message, i) => {
          return (
            <div
              key={message._id}
              style={{ display: "flex", alignItems: "flex-end" }}
            >
              {(isSameSender(messages, message, i, user._id) ||
                isLastMessage(messages, i, user._id)) && (
                <Tooltip
                  label={message.sender.name}
                  placement="bottom-start"
                  hasArrow
                >
                  <Avatar
                    mt="2px"
                    mr={1}
                    size="sm"
                    name={message.sender.name}
                    src={message.sender.pic}
                  />
                </Tooltip>
              )}

              <span
                style={{
                  background:
                    message.sender._id !== user._id ? "#3e4042" : "#0084ff",
                  borderRadius: "20px",
                  padding: "5px 10px",
                  maxWidth: "80%",
                  marginLeft: isSameSenderMargin(
                    messages,
                    message,
                    i,
                    user._id
                  ),
                  marginTop: isSameUser(messages, message, i, user._id)
                    ? 2
                    : 10,
                }}
              >
                {message.content}
              </span>
            </div>
          );
        })}
    </ScrollableFeed>
  );
};

export default ScrollableChat;
