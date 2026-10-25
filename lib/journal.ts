import "server-only";
import { randomUUID } from "node:crypto";
import { db } from "./db";
import {
  readingMinutes,
  type StoryEntry,
  type StorySummary,
  topics,
} from "./types";

import {openingNotes} from './opening-notes';
export async function ensureOpening() {
  const database = db();
  if (await database.prepare("SELECT name FROM migrations WHERE name=?").get("opening-v1")) return;
  await database.transaction(async tx => {
    await tx.prepare("SELECT pg_advisory_xact_lock(hashtext(?))").get("jn-opening-v1");
    if (await tx.prepare("SELECT name FROM migrations WHERE name=?").get("opening-v1")) return;
    const now = new Date().toISOString();
    for (const note of openingNotes) await tx.prepare(`INSERT INTO stories(id,slug,title,excerpt,body,topic,status,createdAt,updatedAt,publishedAt,opening) VALUES(?,?,?,?,?,?,'published',?,?,?,1) ON CONFLICT(slug) DO NOTHING`).run(randomUUID(),note.slug,note.title,note.excerpt,note.body,note.topic,now,now,now);
    await tx.prepare("INSERT INTO migrations(name) VALUES(?)").run("opening-v1");
  });
}
export async function listPublished({
  q = "",
  topic = "",
  page = 1,
  limit = 8,
}: { q?: string; topic?: string; page?: number; limit?: number } = {}) {
  await ensureOpening();
  const term = q.trim().slice(0, 120);
  const category = topics.includes(topic as (typeof topics)[number])
    ? topic
    : "";
  const filter = `status='published' AND (?='' OR topic=?) AND (?='' OR title ILIKE ? ESCAPE '\\' OR excerpt ILIKE ? ESCAPE '\\')`;
  const query = "%" + term.replace(/[\\%_]/g, "\\$&") + "%";
  const params = [category, category, term, query, query];
  const total = Number((
    await db()
      .prepare(`SELECT count(*) AS n FROM stories WHERE ${filter}`)
      .get(...params) as { n: number }
  ).n);
  const safeLimit = Math.min(24, Math.max(1, limit));
  const pages = Math.max(1, Math.ceil(total / safeLimit));
  const current = Math.min(
    pages,
    Math.max(1, Number.isFinite(page) ? Math.floor(page) : 1),
  );
  const entries = await db()
    .prepare(
      `SELECT * FROM stories WHERE ${filter} ORDER BY opening ASC,publishedAt DESC,id ASC LIMIT ? OFFSET ?`,
    )
    .all(
      ...params,
      safeLimit,
      (current - 1) * safeLimit,
    ) as unknown as StoryEntry[];
  return { stories: entries.map(summary), total, page: current, pages };
}
export function summary(s: StoryEntry): StorySummary {
  const { body, ...rest } = s;
  return { ...rest, minutes: readingMinutes(body) };
}
export async function getPublicStory(slug: string) {
  await ensureOpening();
  return await db()
    .prepare("SELECT * FROM stories WHERE slug=? AND status='published'")
    .get(slug) as unknown as StoryEntry | undefined;
}
export async function getAdminStories() {
  await ensureOpening();
  return (await db()
    .prepare("SELECT * FROM stories ORDER BY updatedAt DESC")
    .all() as unknown as StoryEntry[]).map(story=>({...story}));
}
