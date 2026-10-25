import { cookies } from "next/headers";
import {
  checkPassword,
  configured,
  failedLogin,
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
    if (!configured())
      throw new HttpError(503, "Tài khoản quản trị chưa được thiết lập.");
    const wait = loginLimit();
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
      typeof data.email !== "string" ||
      typeof data.password !== "string" ||
      data.email.length > 254 ||
      data.password.length > 256
    )
      throw new HttpError(400, "Nhập địa chỉ email và mật khẩu.");
    failedLogin();
    if (!(await checkPassword(data.email.trim(), data.password))) {
      throw new HttpError(401, "Email hoặc mật khẩu chưa đúng.");
    }
    db()
      .prepare("DELETE FROM login_attempts WHERE bucket=?")
      .run("admin-login");
    (await cookies()).set(sessionCookie, newSession(), {
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
