import express from "express";
import { getAllPosts, createPost } from "../controllers/Posts.controller.js";
import { generateAiImage } from "../controllers/GenerateAiImage.js";

const router = express.Router();

router.post("/", generateAiImage);

export const generateImageRouter = router;