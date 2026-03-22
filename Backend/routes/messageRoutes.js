import express from "express";
import { auth } from "../middlewares/auth.js";
import { getMessages } from "../controllers/messageController.js";

const router = express.Router();

router.get("/messages/:conversationId", auth, getMessages);

export default router;
