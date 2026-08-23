import { NextResponse } from "next/server";
import { requireSession, legacyPasswordHash } from "@/lib/session";
import { isSqlConfigured, runQuery, sql } from "@/lib/db";

export async function POST(request) {
  const session = await requireSession();
  const { oldPassword, newPassword } = await request.json();

  if (!oldPassword || !newPassword || String(newPassword).length < 8) {
    return NextResponse.json(
      { message: "Old password and a new password of at least 8 characters are required." },
      { status: 400 },
    );
  }

  if (!isSqlConfigured()) {
    return NextResponse.json(
      { message: "SQL connection is not configured. Fill lib/sqlConnection.js first." },
      { status: 503 },
    );
  }

  const oldHash = legacyPasswordHash(oldPassword);
  const newHash = legacyPasswordHash(newPassword);

  await runQuery((requestSql) =>
    requestSql
      .input("masterId", sql.Int, session.masterId)
      .input("userId", sql.Int, session.userId)
      .input("oldHash", sql.NVarChar(200), oldHash)
      .input("newHash", sql.NVarChar(200), newHash)
      .query(`
        UPDATE master_user SET pwd = @newHash WHERE id = @masterId AND pwd = @oldHash;
        UPDATE sub_user SET pwd = @newHash WHERE id = @userId AND master_id = @masterId AND pwd = @oldHash;
      `),
  );

  return NextResponse.json({ changed: true });
}
