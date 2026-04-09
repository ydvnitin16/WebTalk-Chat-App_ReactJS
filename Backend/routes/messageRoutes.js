import express from "express";
import { auth } from "../middlewares/auth.js";
import {
    getConversationTimeline,
    getMessages,
} from "../controllers/messageController.js";

const router = express.Router();

router.get("/timeline/:conversationId", auth, getConversationTimeline);
router.get("/messages/:conversationId", auth, getMessages);

export default router;
