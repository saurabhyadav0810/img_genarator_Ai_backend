import express from "express";
import { register, login, verifyOtp, getMe } from "../controllers/Auth.controller.js";
import verifyToken from "../middleware/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verify-otp", verifyOtp);
router.get("/me", verifyToken, getMe);

export default router;
