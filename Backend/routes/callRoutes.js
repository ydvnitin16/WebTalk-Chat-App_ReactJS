import express from "express";
import { auth } from "../middlewares/auth.js";
import { getCallsHistory } from "../controllers/callController.js";

const router = express.Router();

router.get("/calls/:conversationId", auth, getCallsHistory);

export default router;
