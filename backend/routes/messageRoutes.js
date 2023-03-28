import express from "express";
import protect from "../middleware/authMiddleware.js";
import { sendMessage, allMessages } from "../controllers/messageControllers.js";

const router = express.Router();

//Route for sending message
router.route("/").post(protect, sendMessage);

//Route for fetching all of the messages for the selected chat
router.route("/:chatID").get(protect, allMessages);

export default router;
