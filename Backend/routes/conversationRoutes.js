import express from "express";
import { auth } from "../middlewares/auth.js";
import { getUserConversations } from "../controllers/conversationController.js";

const router = express.Router();

router.get("/conversations", auth, getUserConversations);

export default router;
