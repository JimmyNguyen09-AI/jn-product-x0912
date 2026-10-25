import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import path from "node:path";
export const dataDirectory = path.resolve(
  /* turbopackIgnore: true */ process.env.DATA_DIR ||
    path.join(process.cwd(), "data"),
);
const globalDb = globalThis as typeof globalThis & {
  jnDatabase?: DatabaseSync;
};
export function db() {
  if (globalDb.jnDatabase) return globalDb.jnDatabase;
  mkdirSync(dataDirectory, { recursive: true, mode: 0o700 });
  const database = new DatabaseSync(path.join(dataDirectory, "journal.sqlite"));
  database.exec(`PRAGMA journal_mode=WAL;PRAGMA foreign_keys=ON;PRAGMA busy_timeout=5000;
 CREATE TABLE IF NOT EXISTS admins(id INTEGER PRIMARY KEY CHECK(id=1), email TEXT NOT NULL UNIQUE, passwordHash TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS sessions(tokenHash TEXT PRIMARY KEY,adminId INTEGER NOT NULL REFERENCES admins(id),expires INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS login_attempts(bucket TEXT PRIMARY KEY,count INTEGER NOT NULL,resetAt INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS stories(id TEXT PRIMARY KEY,slug TEXT NOT NULL UNIQUE,title TEXT NOT NULL,excerpt TEXT NOT NULL,body TEXT NOT NULL,topic TEXT NOT NULL CHECK(topic IN ('alone','trust','within','becoming')),status TEXT NOT NULL CHECK(status IN ('draft','published','archived')),cover TEXT NOT NULL DEFAULT '',coverAlt TEXT NOT NULL DEFAULT '',createdAt TEXT NOT NULL,updatedAt TEXT NOT NULL,publishedAt TEXT,version INTEGER NOT NULL DEFAULT 1,opening INTEGER NOT NULL DEFAULT 0);
 CREATE INDEX IF NOT EXISTS stories_status_date ON stories(status,publishedAt DESC);
 CREATE TABLE IF NOT EXISTS uploads(id TEXT PRIMARY KEY,filename TEXT NOT NULL,width INTEGER NOT NULL,height INTEGER NOT NULL,createdAt TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS audit(id INTEGER PRIMARY KEY,event TEXT NOT NULL,storyId TEXT,createdAt TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS migrations(name TEXT PRIMARY KEY);
 `);
  globalDb.jnDatabase = database;
  return database;
}
