import express from "express";
import verifyToken from "../middleware/auth.js";
import { getConversations, getMessages, createConversation } from "../controllers/chat.controller.js";

const router = express.Router();

router.get("/", verifyToken, getConversations);
router.post("/conversation", verifyToken, createConversation);
router.get("/:conversationId", verifyToken, getMessages);

export default router;
