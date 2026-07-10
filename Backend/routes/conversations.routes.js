import express from "express";
import { auth } from "../middlewares/auth.js";
import { getCalls, getConversations, getMessages, getTimeline } from "../controllers/conversations.controller.js";

const conversationsRouter = express.Router();

conversationsRouter.get("/", auth, getConversations);
conversationsRouter.get("/:conversationId/messages", auth, getMessages);
conversationsRouter.get("/:conversationId/calls", auth, getCalls);
conversationsRouter.get("/:conversationId/timeline", auth, getTimeline)

export default conversationsRouter;
