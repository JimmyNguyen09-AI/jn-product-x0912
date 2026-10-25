import { sessionAdmin } from "./auth";
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export function response(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
export function errorResponse(error: unknown) {
  if (error instanceof HttpError)
    return response({ error: error.message }, error.status);
  if (error && typeof error === "object" && "code" in error && error.code === "23505")
    return response({ error: "Đường dẫn này đã được dùng. Hãy chọn đường dẫn khác." }, 409);
  console.error(
    "Journal request failed:",
    error instanceof Error ? error.message : "Unknown error",
  );
  return response({ error: "Có lỗi xảy ra. Vui lòng thử lại." }, 500);
}
export function sameOrigin(request: Request) {
  const expected = process.env.SITE_URL
    ? new URL(process.env.SITE_URL).origin
    : new URL(request.url).origin;
  if (request.headers.get("origin") !== expected)
    throw new HttpError(403, "Yêu cầu này không được chấp nhận.");
  if (
    process.env.NODE_ENV === "production" &&
    (!process.env.SITE_URL ||
      new URL(process.env.SITE_URL).protocol !== "https:")
  )
    throw new HttpError(503, "Địa chỉ HTTPS của website chưa được thiết lập.");
}
export async function requireAdmin(request?: Request) {
  if (request && request.method !== "GET") sameOrigin(request);
  const admin = await sessionAdmin();
  if (!admin) throw new HttpError(401, "Vui lòng đăng nhập để tiếp tục.");
  return admin;
}
export async function readBody(request: Request, limit = 120_000) {
  if (Number(request.headers.get("content-length") || 0) > limit)
    throw new HttpError(413, "Tệp tải lên quá lớn.");
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, "Yêu cầu cần có dữ liệu.");
  let length = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > limit) {
      await reader.cancel();
      throw new HttpError(413, "Tệp tải lên quá lớn.");
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}
export async function readJson(request: Request) {
  try {
    return JSON.parse((await readBody(request)).toString("utf8"));
  } catch (e) {
    if (e instanceof HttpError) throw e;
    throw new HttpError(400, "Dữ liệu gửi lên không đúng định dạng.");
  }
}
