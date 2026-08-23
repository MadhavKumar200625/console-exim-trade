import nodemailer from "nodemailer";
import emailConfig from "./emailConfig";

export function isEmailConfigured() {
  return Boolean(emailConfig.host && emailConfig.user && emailConfig.password);
}

export async function sendOtpEmail(to, otp) {
  if (!isEmailConfigured()) {
    return {
      sent: false,
      message: "Email is not configured. Fill lib/emailConfig.js first.",
    };
  }

  const transporter = nodemailer.createTransport({
    host: emailConfig.host,
    port: emailConfig.port,
    secure: emailConfig.secure,
    auth: {
      user: emailConfig.user,
      pass: emailConfig.password,
    },
  });

  await transporter.sendMail({
    from: emailConfig.from || emailConfig.user,
    to,
    subject: "Your Console login OTP",
    text: `Your Console login OTP is ${otp}. It expires in 10 minutes.`,
  });

  return { sent: true };
}
