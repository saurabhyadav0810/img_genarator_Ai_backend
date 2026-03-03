import { sendEmail } from "../sendEmail.js";

export const sendOtpEmail = async (email, otp) => {
  const subject = "Your OTP Code – GenAI";
  const text = `Your one-time password is: ${otp}\n\nThis code will expire in 5 minutes. If you did not request this, please ignore this email.`;
  await sendEmail(email, subject, text);
};
