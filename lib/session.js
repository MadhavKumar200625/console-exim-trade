import { cookies } from "next/headers";
import crypto from "crypto";

const SESSION_COOKIE = "console_session";
const PENDING_COOKIE = "console_pending_login";
const OTP_TTL_MS = 10 * 60 * 1000;
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

function getSecret() {
  return process.env.AUTH_SECRET || "replace-this-auth-secret-before-production";
}

function sign(value) {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("base64url");
}

function encode(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

function decode(token) {
  if (!token || !token.includes(".")) return null;
  const [body, signature] = token.split(".");
  const expected = sign(body);
  const valid =
    signature.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));

  if (!valid) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (!payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function getSession() {
  const store = await cookies();
  return decode(store.get(SESSION_COOKIE)?.value);
}

export async function requireSession() {
  const session = await getSession();
  if (!session?.masterId || !session?.userId) {
    const error = new Error("Authentication required.");
    error.status = 401;
    throw error;
  }
  return session;
}

export async function setSession(user) {
  const store = await cookies();
  store.set(
    SESSION_COOKIE,
    encode({
      masterId: user.masterId,
      userId: user.userId,
      email: user.email,
      name: user.name,
      companyName: user.companyName,
      exp: Date.now() + SESSION_TTL_MS,
    }),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_TTL_MS / 1000,
    },
  );
}

export async function clearSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  store.delete(PENDING_COOKIE);
}

export async function setPendingLogin(user, otpHash) {
  const store = await cookies();
  store.set(
    PENDING_COOKIE,
    encode({
      masterId: user.masterId,
      userId: user.userId,
      email: user.email,
      name: user.name,
      companyName: user.companyName,
      otpHash,
      exp: Date.now() + OTP_TTL_MS,
    }),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: OTP_TTL_MS / 1000,
    },
  );
}

export async function getPendingLogin() {
  const store = await cookies();
  return decode(store.get(PENDING_COOKIE)?.value);
}

export async function clearPendingLogin() {
  const store = await cookies();
  store.delete(PENDING_COOKIE);
}

export function hashOtp(otp) {
  return crypto.createHash("sha256").update(String(otp)).digest("hex");
}

export function legacyPasswordHash(password) {
  return crypto
    .createHash("sha256")
    .update(String(password).trim(), "utf8")
    .digest("hex")
    .toUpperCase()
    .match(/.{1,2}/g)
    .join("-");
}

export function safeCompare(a, b) {
  const left = Buffer.from(String(a || ""));
  const right = Buffer.from(String(b || ""));
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}
