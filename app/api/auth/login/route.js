import { NextResponse } from "next/server";
import { hashOtp, setPendingLogin } from "@/lib/session";
import { verifyUserPassword } from "@/lib/userDb";

const STATIC_LOGIN_OTP = "123456";

export async function POST(request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ message: "Email and password are required." }, { status: 400 });
  }

  const { user } = await verifyUserPassword(String(email).trim().toLowerCase(), password);
  if (!user) {
    return NextResponse.json({ message: "Invalid login details." }, { status: 401 });
  }

  await setPendingLogin(user, hashOtp(STATIC_LOGIN_OTP));

  return NextResponse.json({
    message: "Enter the verification code to continue.",
    otpRequired: true,
  });
}
