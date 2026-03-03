import mongoose from "mongoose";
import bcrypt from "bcrypt"
const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true
    },
    otp: {
      type: String,
      required: true
    },
    expiresAt: {
      type: Date,
      required: true
    }
  }
);

otpSchema.pre("save", async function () {
  if (!this.isModified("otp")) return;

  const saltRounds = 10;
  this.otp = await bcrypt.hash(this.otp, saltRounds);
});
export default mongoose.model("OTP", otpSchema);
