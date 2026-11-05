import { NextResponse } from "next/server";
import crypto from "crypto";
import { sendOtpEmail } from "@/lib/email";
import { hashOtp, setPendingLogin } from "@/lib/session";
import { verifyUserPassword } from "@/lib/userDb";

export async function POST(request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ message: "Email and password are required." }, { status: 400 });
  }

  const { user } = await verifyUserPassword(String(email).trim().toLowerCase(), password);
  if (!user) {
    return NextResponse.json({ message: "Invalid login details." }, { status: 401 });
  }

  const otp = String(crypto.randomInt(100000, 1000000));
  let emailResult;
  try {
    emailResult = await sendOtpEmail(user.email, otp);
  } catch {
    return NextResponse.json({ message: "Unable to send login verification code." }, { status: 503 });
  }
  if (!emailResult.sent) {
    return NextResponse.json({ message: "Login verification email is unavailable." }, { status: 503 });
  }

  await setPendingLogin(user, hashOtp(otp));

  return NextResponse.json({
    message: "OTP sent to your email.",
    otpRequired: true,
  });
}
