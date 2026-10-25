import { cookies } from "next/headers";
import {
  checkPassword,
  configured,
  loginLimit,
  newSession,
  sessionCookie,
  sessionSeconds,
} from "@/lib/auth";
import { db } from "@/lib/db";
import {
  sameOrigin,
  readJson,
  response,
  errorResponse,
  HttpError,
} from "@/lib/http";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    if (!(await configured()))
      throw new HttpError(503, "Tài khoản quản trị chưa được thiết lập.");
    const wait = await loginLimit();
    if (wait)
      return Response.json(
        { error: "Bạn đã thử quá nhiều lần. Vui lòng thử lại sau." },
        {
          status: 429,
          headers: { "Retry-After": String(wait), "Cache-Control": "no-store" },
        },
      );
    const data = await readJson(request);
    if (
      typeof data.username !== "string" ||
      typeof data.password !== "string" ||
      data.username.length > 64 ||
      data.password.length > 256
    )
      throw new HttpError(400, "Nhập tên đăng nhập và mật khẩu.");
    if (!(await checkPassword(data.username.trim(), data.password))) {
      throw new HttpError(401, "Tên đăng nhập hoặc mật khẩu chưa đúng.");
    }
    await db()
      .prepare("DELETE FROM login_attempts WHERE bucket=?")
      .run("admin-login");
    (await cookies()).set(sessionCookie, await newSession(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: sessionSeconds,
    });
    return response({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
