import "server-only";
import {
  randomBytes,
  createHash,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { db } from "./db";
const scrypt = promisify(scryptCallback);
export const sessionCookie =
  process.env.NODE_ENV === "production" ? "__Host-jn-session" : "jn-session";
export const sessionSeconds = 8 * 60 * 60;
export async function configured() {
  return Boolean(await db().prepare("SELECT id FROM admins WHERE id=1").get());
}
export async function sessionAdmin() {
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  return (
    (await db()
      .prepare(
        "SELECT admins.id,admins.username FROM sessions JOIN admins ON admins.id=sessions.adminId WHERE tokenHash=? AND expires>?",
      )
      .get(createHash("sha256").update(token).digest("hex"), Date.now()) as
      { id: number; username: string } | undefined) || null
  );
}
export async function checkPassword(username: string, password: string) {
  const admin = await db()
    .prepare("SELECT username,passwordHash FROM admins WHERE id=1")
    .get() as { username: string; passwordHash: string } | undefined;
  const [salt, hash] = admin?.passwordHash.split(":") || [
    "00000000000000000000000000000000",
    "0".repeat(128),
  ];
  const actual = (await scrypt(password, salt, 64)) as Buffer;
  const expected = Buffer.from(hash, "hex");
  return Boolean(
    admin &&
    username.toLowerCase() === admin.username &&
    expected.length === actual.length &&
    timingSafeEqual(actual, expected),
  );
}
export async function newSession() {
  const token = randomBytes(32).toString("hex");
  await db().prepare("DELETE FROM sessions WHERE expires<=?").run(Date.now());
  await db()
    .prepare("INSERT INTO sessions(tokenHash,adminId,expires) VALUES(?,1,?)")
    .run(
      createHash("sha256").update(token).digest("hex"),
      Date.now() + sessionSeconds * 1000,
    );
  return token;
}
export async function revokeSession() {
  const token = (await cookies()).get(sessionCookie)?.value;
  if (token)
    await db()
      .prepare("DELETE FROM sessions WHERE tokenHash=?")
      .run(createHash("sha256").update(token).digest("hex"));
}
export async function loginLimit() {
  const now = Date.now();
  // Reserve an attempt atomically, including concurrent requests across servers.
  const row = await db()
    .prepare(
      "INSERT INTO login_attempts(bucket,count,resetAt) VALUES(?,1,?) ON CONFLICT(bucket) DO UPDATE SET count=CASE WHEN login_attempts.resetAt<=? THEN 1 ELSE login_attempts.count+1 END,resetAt=CASE WHEN login_attempts.resetAt<=? THEN EXCLUDED.resetAt ELSE login_attempts.resetAt END RETURNING count,resetAt",
    )
    .get("admin-login", now + 15 * 60 * 1000, now, now);
  return row && row.count > 8 ? Math.max(1, Math.ceil((Number(row.resetAt) - now) / 1000)) : 0;
}
