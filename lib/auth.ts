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
export function configured() {
  return Boolean(db().prepare("SELECT id FROM admins WHERE id=1").get());
}
export async function sessionAdmin() {
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  return (
    (db()
      .prepare(
        "SELECT admins.id,admins.email FROM sessions JOIN admins ON admins.id=sessions.adminId WHERE tokenHash=? AND expires>?",
      )
      .get(createHash("sha256").update(token).digest("hex"), Date.now()) as
      { id: number; email: string } | undefined) || null
  );
}
export async function checkPassword(email: string, password: string) {
  const admin = db()
    .prepare("SELECT email,passwordHash FROM admins WHERE id=1")
    .get() as { email: string; passwordHash: string } | undefined;
  const [salt, hash] = admin?.passwordHash.split(":") || [
    "00000000000000000000000000000000",
    "0".repeat(128),
  ];
  const actual = (await scrypt(password, salt, 64)) as Buffer;
  const expected = Buffer.from(hash, "hex");
  return Boolean(
    admin &&
    email.toLowerCase() === admin.email &&
    expected.length === actual.length &&
    timingSafeEqual(actual, expected),
  );
}
export function newSession() {
  const token = randomBytes(32).toString("hex");
  db().prepare("DELETE FROM sessions WHERE expires<=?").run(Date.now());
  db()
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
    db()
      .prepare("DELETE FROM sessions WHERE tokenHash=?")
      .run(createHash("sha256").update(token).digest("hex"));
}
export function loginLimit() {
  const now = Date.now();
  db().prepare("DELETE FROM login_attempts WHERE resetAt<=?").run(now);
  const row = db()
    .prepare("SELECT count,resetAt FROM login_attempts WHERE bucket=?")
    .get("admin-login") as { count: number; resetAt: number } | undefined;
  return row && row.count >= 8 ? Math.ceil((row.resetAt - now) / 1000) : 0;
}
export function failedLogin() {
  db()
    .prepare(
      "INSERT INTO login_attempts(bucket,count,resetAt) VALUES(?,1,?) ON CONFLICT(bucket) DO UPDATE SET count=count+1",
    )
    .run("admin-login", Date.now() + 15 * 60 * 1000);
}
