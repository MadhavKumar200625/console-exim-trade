import { NextResponse } from "next/server";
import {
  clearPendingLogin,
  getPendingLogin,
  hashOtp,
  safeCompare,
  setSession,
} from "@/lib/session";

export async function POST(request) {
  const { otp } = await request.json();
  const pending = await getPendingLogin();

  if (!pending?.otpHash) {
    return NextResponse.json({ message: "OTP session expired. Login again." }, { status: 401 });
  }

  if (!safeCompare(hashOtp(otp), pending.otpHash)) {
    return NextResponse.json({ message: "Invalid OTP." }, { status: 401 });
  }

  await setSession(pending);
  await clearPendingLogin();

  return NextResponse.json({
    user: {
      masterId: pending.masterId,
      userId: pending.userId,
      email: pending.email,
      name: pending.name,
      companyName: pending.companyName,
    },
  });
}
