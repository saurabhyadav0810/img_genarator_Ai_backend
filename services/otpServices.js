import bcrypt from "bcrypt";
import OTP from "../models/otp.js";

export const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const saveOtp = async (email, otp) => {
    await OTP.deleteMany({ email });

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const newOtp = new OTP({
        email,
        otp,
        expiresAt,
    });

    await newOtp.save();
    console.log("Generated OTP for:", email);
};

export const verifyOtp = async (email, otp) => {
    const record = await OTP.findOne({ email });

    if (!record) {
        throw new Error("OTP not found");
    }
    if (record.expiresAt < new Date()) {
        await OTP.deleteOne({ email });
        throw new Error("OTP expired");
    }
    // Compare plain-text OTP with bcrypt hash stored in DB
    const isValid = await bcrypt.compare(otp, record.otp);
    if (!isValid) {
        throw new Error("Invalid OTP");
    }
    await OTP.deleteOne({ email });
    return true;
};