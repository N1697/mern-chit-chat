import express from "express";
import {
  registerUser,
  authUser,
  allUsers,
} from "../controllers/userControllers.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").post(registerUser).get(protect, allUsers); //1st way to create a route
router.post("/login", authUser); //2nd way to create a route

//resgisterUser: Create new user
//authUser: Authenticate the logging in user
//allUsers: Create the user searching API endpoint
export default router;
