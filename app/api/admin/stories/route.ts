import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { getAdminStories } from "@/lib/journal";
import {
  requireAdmin,
  readJson,
  response,
  errorResponse,
  HttpError,
} from "@/lib/http";
import { validateStory } from "@/lib/story-input";
export async function GET() {
  try {
    await requireAdmin();
    return response({ stories: getAdminStories() });
  } catch (e) {
    return errorResponse(e);
  }
}
export async function POST(request: Request) {
  try {
    await requireAdmin(request);
    const data = validateStory(await readJson(request));
    if (db().prepare("SELECT id FROM stories WHERE slug=?").get(data.slug))
      throw new HttpError(409, "Đường dẫn này đã được dùng cho một câu chuyện khác.");
    const id = randomUUID(),
      now = new Date().toISOString();
    const database = db();
    database.exec("BEGIN IMMEDIATE");
    try {
      database
        .prepare(
          `INSERT INTO stories(id,slug,title,excerpt,body,topic,status,cover,coverAlt,createdAt,updatedAt,publishedAt) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`,
        )
        .run(
          id,
          data.slug,
          data.title,
          data.excerpt,
          data.body,
          data.topic,
          data.status,
          data.cover,
          data.coverAlt,
          now,
          now,
          data.status === "published" ? now : null,
        );
      database
        .prepare("INSERT INTO audit(event,storyId,createdAt) VALUES(?,?,?)")
        .run("story.created", id, now);
      database.exec("COMMIT");
    } catch (e) {
      database.exec("ROLLBACK");
      throw e;
    }
    return response(
      { story: database.prepare("SELECT * FROM stories WHERE id=?").get(id) },
      201,
    );
  } catch (e) {
    return errorResponse(e);
  }
}
