import { cookies } from "next/headers";
import { revokeSession, sessionCookie } from "@/lib/auth";
import { sameOrigin, response, errorResponse } from "@/lib/http";
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    await revokeSession();
    (await cookies()).set(sessionCookie, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 0,
    });
    return response({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
