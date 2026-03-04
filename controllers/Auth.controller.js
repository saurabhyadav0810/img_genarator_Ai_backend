import User from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import createError from "../error.js";
import { sendOtpEmail } from "../utils/mailer.js";

const generateOtp = () =>
  crypto.randomInt(100000, 999999).toString();

const generateToken = (user) =>
  jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

export const register = async (req, res, next) => {
  try {
    const { name, username, email } = req.body;
    if (!name || !username || !email)
      return next(createError(400, "Name, username, and email are required"));

    // Validate username format
    if (!/^[a-zA-Z0-9_]+$/.test(username))
      return next(createError(400, "Username can only contain letters, numbers, and underscores"));

    // Check if username is taken by another verified user
    const existingUsername = await User.findOne({
      username: username.toLowerCase(),
      verified: true,
    });
    if (existingUsername)
      return next(createError(409, "Username is already taken"));

    let user = await User.findOne({ email });
    if (user && user.verified)
      return next(createError(409, "Email already registered"));

    const otp = generateOtp();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min

    if (user) {
      user.name = name;
      user.username = username.toLowerCase();
      user.otp = otp;
      user.otpExpiresAt = otpExpiresAt;
      await user.save();
    } else {
      user = await User.create({
        name,
        username: username.toLowerCase(),
        email,
        otp,
        otpExpiresAt,
      });
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
      user: { id: user._id, name: user.name, username: user.username, email: user.email },
    });
  } catch (err) {
    next(createError(err.status || 500, err.message));
  }
};


export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select("-otp -otpExpiresAt");
    if (!user) return next(createError(404, "User not found"));
    return res.status(200).json({
      success: true,
      user: { id: user._id, name: user.name, username: user.username, email: user.email },
    });
  } catch (err) {
    next(createError(err.status || 500, err.message));
  }
};


export const searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 1)
      return res.status(200).json({ success: true, users: [] });

    const users = await User.find({
      _id: { $ne: req.userId },
      verified: true,
      $or: [
        { username: { $regex: q, $options: "i" } },
        { name: { $regex: q, $options: "i" } },
      ],
    })
      .select("name username email")
      .limit(20);

    return res.status(200).json({ success: true, users });
  } catch (err) {
    next(createError(err.status || 500, err.message));
  }
};
