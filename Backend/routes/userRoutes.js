import express from "express";
import { validateUser } from "../middlewares/userValidate.js";
import {
    registerUser,
    loginUser,
    logoutUser,
    getUserByUsername,
} from "../controllers/userController.js";
import { auth } from "../middlewares/auth.js";

const router = express.Router();

router.post("/register", validateUser("register"), registerUser);
router.post("/login", validateUser("login"), loginUser);
router.delete("/logout", logoutUser);
router.get("/user/search", auth, getUserByUsername);

export default router;
