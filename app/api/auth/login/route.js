import { NextResponse } from "next/server";
import crypto from "crypto";
import { sendOtpEmail, isEmailConfigured } from "@/lib/email";
import { hashOtp, setPendingLogin } from "@/lib/session";
import { verifyUserPassword } from "@/lib/userDb";

export async function POST(request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ message: "Email and password are required." }, { status: 400 });
  }

  const user = await verifyUserPassword(String(email).trim().toLowerCase(), password);
  if (!user) {
    return NextResponse.json({ message: "Invalid login details." }, { status: 401 });
  }

  const otp = String(crypto.randomInt(100000, 1000000));
  await setPendingLogin(user, hashOtp(otp));
  const emailResult = await sendOtpEmail(user.email, otp);

  return NextResponse.json({
    message: emailResult.sent
      ? "OTP sent to your email."
      : "OTP generated. Configure email before production.",
    otpRequired: true,
    emailConfigured: isEmailConfigured(),
    devOtp: emailResult.sent ? undefined : otp,
  });
}
