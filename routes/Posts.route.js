import express from "express";
import { getAllPosts, createPost } from "../controllers/Posts.controller.js";
import verifyToken from "../middleware/auth.js";

const router = express.Router();

router.get("/", getAllPosts);
router.post("/", verifyToken, createPost);
export default router;