import User from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import createError from "../error.js";
import { sendOtpEmail } from "../utils/mailer.js";

const generateOtp = () =>
  crypto.randomInt(100000, 999999).toString();

const generateToken = (user) =>
  jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

// ── Register: create user + send OTP ──
export const register = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) return next(createError(400, "Name and email are required"));

    let user = await User.findOne({ email });
    if (user && user.verified) return next(createError(409, "Email already registered"));

    const otp = generateOtp();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min

    if (user) {
      user.name = name;
      user.otp = otp;
      user.otpExpiresAt = otpExpiresAt;
      await user.save();
    } else {
      user = await User.create({ name, email, otp, otpExpiresAt });
    }

    await sendOtpEmail(email, otp);

    return res.status(200).json({
      success: true,
      message: "OTP sent to your email",
    });
  } catch (err) {
    next(createError(err.status || 500, err.message));
  }
};

// ── Login: send OTP to existing verified user ──
export const login = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return next(createError(400, "Email is required"));

    const user = await User.findOne({ email });
    if (!user || !user.verified)
      return next(createError(404, "No verified account found with this email"));

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    await sendOtpEmail(email, otp);

    return res.status(200).json({
      success: true,
      message: "OTP sent to your email",
    });
  } catch (err) {
    next(createError(err.status || 500, err.message));
  }
};

// ── Verify OTP (works for both register & login) ──
export const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return next(createError(400, "Email and OTP are required"));

    const user = await User.findOne({ email });
    if (!user) return next(createError(404, "User not found"));

    if (user.otp !== otp) return next(createError(400, "Invalid OTP"));
    if (user.otpExpiresAt < new Date()) return next(createError(400, "OTP has expired"));

    user.verified = true;
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    next(createError(err.status || 500, err.message));
  }
};

// ── Get current user (protected) ──
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select("-otp -otpExpiresAt");
    if (!user) return next(createError(404, "User not found"));
    return res.status(200).json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    next(createError(err.status || 500, err.message));
  }
};
