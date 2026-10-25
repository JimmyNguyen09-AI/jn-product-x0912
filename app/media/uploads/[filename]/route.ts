import { db } from "@/lib/db";
import { sessionAdmin } from "@/lib/auth";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params;
  if (!/^[a-f0-9-]{36}\.webp$/.test(filename))
    return new Response(null, { status: 404 });
  const upload = await db()
    .prepare("SELECT content FROM uploads WHERE filename=?")
    .get(filename);
  if (!upload) return new Response(null, { status: 404 });
  const url = `/media/uploads/${filename}`;
  const publicUse = await db()
    .prepare(
      "SELECT id FROM stories WHERE status='published' AND (cover=? OR strpos(body,?)>0) LIMIT 1",
    )
    .get(url, url);
  if (!publicUse && !(await sessionAdmin()))
    return new Response(null, { status: 404 });
  try {
    const image = new Uint8Array(upload.content);
    return new Response(image, {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; sandbox",
      },
    });
  } catch {
    return new Response(null, { status: 404 });
  }
}
