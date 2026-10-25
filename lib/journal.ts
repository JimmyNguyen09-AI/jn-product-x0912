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
function migrateOpeningLanguage() {
 const database=db();
 if(database.prepare('SELECT name FROM migrations WHERE name=?').get('opening-vi-v1'))return;
 database.exec('BEGIN IMMEDIATE');
 try {
  if(!database.prepare('SELECT name FROM migrations WHERE name=?').get('opening-vi-v1')) {
   for(const note of openingNotes) database.prepare('UPDATE stories SET title=?,excerpt=?,body=? WHERE slug=? AND title=? AND opening=1 AND version=1 AND updatedAt=createdAt').run(note.title,note.excerpt,note.body,note.slug,note.oldTitle);
   database.prepare('INSERT INTO migrations(name) VALUES(?)').run('opening-vi-v1');
  }
  database.exec('COMMIT');
 }catch(error){database.exec('ROLLBACK');throw error;}
}
export function ensureOpening() {
  const database = db();
  if (
    database
      .prepare("SELECT name FROM migrations WHERE name=?")
      .get("opening-v1")
  ) { migrateOpeningLanguage(); return; }
  database.exec("BEGIN IMMEDIATE");
  try {
    if (
      !database
        .prepare("SELECT name FROM migrations WHERE name=?")
        .get("opening-v1")
    ) {
      const now = new Date().toISOString();
      for (const note of openingNotes)
        database
          .prepare(
            `INSERT INTO stories(id,slug,title,excerpt,body,topic,status,createdAt,updatedAt,publishedAt,opening) VALUES(?,?,?,?,?,?,'published',?,?,?,1)`,
          )
          .run(
            randomUUID(),
            note.slug,
            note.title,
            note.excerpt,
            note.body,
            note.topic,
            now,
            now,
            now,
          );
      database
        .prepare("INSERT INTO migrations(name) VALUES(?)")
        .run("opening-v1");
    }
    database.exec("COMMIT");
  } catch (e) {
    database.exec("ROLLBACK");
    throw e;
  }
  migrateOpeningLanguage();
}
export function listPublished({
  q = "",
  topic = "",
  page = 1,
  limit = 8,
}: { q?: string; topic?: string; page?: number; limit?: number } = {}) {
  ensureOpening();
  const term = q.trim().slice(0, 120);
  const category = topics.includes(topic as (typeof topics)[number])
    ? topic
    : "";
  const filter = `status='published' AND (?='' OR topic=?) AND (?='' OR title LIKE ? ESCAPE '\\' OR excerpt LIKE ? ESCAPE '\\')`;
  const query = "%" + term.replace(/[\\%_]/g, "\\$&") + "%";
  const params = [category, category, term, query, query];
  const total = (
    db()
      .prepare(`SELECT count(*) AS n FROM stories WHERE ${filter}`)
      .get(...params) as { n: number }
  ).n;
  const safeLimit = Math.min(24, Math.max(1, limit));
  const pages = Math.max(1, Math.ceil(total / safeLimit));
  const current = Math.min(
    pages,
    Math.max(1, Number.isFinite(page) ? Math.floor(page) : 1),
  );
  const entries = db()
    .prepare(
      `SELECT * FROM stories WHERE ${filter} ORDER BY opening ASC,publishedAt DESC,rowid ASC LIMIT ? OFFSET ?`,
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
export function getPublicStory(slug: string) {
  ensureOpening();
  return db()
    .prepare("SELECT * FROM stories WHERE slug=? AND status='published'")
    .get(slug) as unknown as StoryEntry | undefined;
}
export function getAdminStories() {
  ensureOpening();
  return (db()
    .prepare("SELECT * FROM stories ORDER BY updatedAt DESC")
    .all() as unknown as StoryEntry[]).map(story=>({...story}));
}
