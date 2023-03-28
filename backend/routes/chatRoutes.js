import express from "express";
import {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroupChat,
  removeFromGroupChat,
  addToGroupChat,
} from "../controllers/chatControllers.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

//Route for accessing/creating the chat
router.route("/").post(protect, accessChat);

//Route for getting all of the chats from the database for the logged-in user
router.route("/").get(protect, fetchChats);

//Route for creating group chat
router.route("/group").post(protect, createGroupChat);

//Route for renaming a group chat
router.route("/rename").put(protect, renameGroupChat);

//Route for removing a user from/leave the group
router.route("/remove").put(protect, removeFromGroupChat);

//Route for adding a user to the group
router.route("/add").put(protect, addToGroupChat);

export default router;
