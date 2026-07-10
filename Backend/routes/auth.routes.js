import express from "express";

import { validateUser } from "../middlewares/userValidate.js";
import { loginUser, logoutUser, registerUser } from "../controllers/auth.controller.js";


const authRouter = express.Router();

authRouter.post("/register", validateUser("register"), registerUser);
authRouter.post("/login", validateUser("login"), loginUser);
authRouter.delete("/logout", logoutUser);

export default authRouter;
