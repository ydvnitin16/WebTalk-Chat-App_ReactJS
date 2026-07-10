import express from "express";
import multer from "multer";
import {
  getUserByUsername,
  updateProfile,
} from "../controllers/users.controller.js";
import { auth } from "../middlewares/auth.js";

const usersRouter = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

usersRouter.get("/", auth, getUserByUsername);
usersRouter.put("/profile", auth, upload.single("avatar"), updateProfile);

export default usersRouter;
