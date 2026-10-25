import { db } from "@/lib/db";
import {
  requireAdmin,
  readJson,
  response,
  errorResponse,
  HttpError,
} from "@/lib/http";
import { validateStory } from "@/lib/story-input";
import type { StoryEntry } from "@/lib/types";
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    const data = await validateStory(await readJson(request));
    const existing = await db()
      .prepare("SELECT * FROM stories WHERE id=?")
      .get(id) as unknown as StoryEntry | undefined;
    if (!existing) throw new HttpError(404, "Không tìm thấy câu chuyện.");
    if (data.version !== existing.version)
      throw new HttpError(
        409,
        "Câu chuyện đã được sửa ở tab khác. Hãy tải lại trước khi lưu.",
      );
    if (
      await db()
        .prepare("SELECT id FROM stories WHERE slug=? AND id<>?")
        .get(data.slug, id)
    )
      throw new HttpError(409, "Đường dẫn này đã được dùng cho một câu chuyện khác.");
    const now = new Date().toISOString(),
      database = db();
    await database.transaction(async tx => {
      const updated = await tx
        .prepare(
          `UPDATE stories SET slug=?,title=?,excerpt=?,body=?,topic=?,status=?,cover=?,coverAlt=?,updatedAt=?,publishedAt=?,version=version+1 WHERE id=? AND version=?`,
        )
        .run(
          data.slug,
          data.title,
          data.excerpt,
          data.body,
          data.topic,
          data.status,
          data.cover,
          data.coverAlt,
          now,
          existing.publishedAt || (data.status === "published" ? now : null),
          id,
          data.version,
        );
      if (!updated.changes)
        throw new HttpError(
          409,
          "Câu chuyện đã được sửa ở tab khác. Hãy tải lại trước khi lưu.",
        );
      await tx
        .prepare("INSERT INTO audit(event,storyId,createdAt) VALUES(?,?,?)")
        .run(`story.${data.status}`, id, now);
    });
    return response({
      story: await database.prepare("SELECT * FROM stories WHERE id=?").get(id),
    });
  } catch (e) {
    return errorResponse(e);
  }
}
