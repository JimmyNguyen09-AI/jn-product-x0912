import { Pool, type PoolClient, type QueryResultRow } from "pg";
const schema = process.env.DATABASE_SCHEMA || "jn_story";
if (!/^[a-z][a-z0-9_]{0,62}$/.test(schema)) throw new Error("Invalid DATABASE_SCHEMA");
const state = globalThis as typeof globalThis & { jnPostgres?: Pool; jnPostgresReady?: Promise<void>; jnPostgresKey?: string };
const columns = /\b(passwordHash|tokenHash|adminId|resetAt|coverAlt|createdAt|updatedAt|publishedAt|storyId)\b/g;
function sql(source: string) {
  let index = 0;
  return source.replace(/\?/g, () => `$${++index}`)
    .replace(columns, '"$1"')
    .replace(/\b(FROM|JOIN|INTO|UPDATE|TABLE(?: IF NOT EXISTS)?)\s+(admins|sessions|login_attempts|stories|uploads|audit|migrations)\b/gi, `$1 "${schema}".$2`);
}
function pool() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
  const key = `${process.env.DATABASE_URL}|${schema}`;
  if (state.jnPostgres && state.jnPostgresKey !== key) {
    void state.jnPostgres.end();
    state.jnPostgres = undefined;
    state.jnPostgresReady = undefined;
  }
  if (!state.jnPostgres) {
    const connection = new URL(process.env.DATABASE_URL);
    if (connection.hostname.endsWith(".neon.tech")) connection.searchParams.set("sslmode", "verify-full");
    state.jnPostgres = new Pool({ connectionString: connection.toString(), enableChannelBinding: true, max: 5, connectionTimeoutMillis: 15000, idleTimeoutMillis: 10000, allowExitOnIdle: true });
    state.jnPostgres.on("error", () => console.error("PostgreSQL idle connection failed"));
    state.jnPostgresKey = key;
  }
  return state.jnPostgres;
}
async function initialize() {
  const client = await pool().connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [`${schema}:schema-v1`]);
    await client.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);
    await client.query(sql(`
      CREATE TABLE IF NOT EXISTS admins(id INTEGER PRIMARY KEY CHECK(id=1),username TEXT NOT NULL UNIQUE,passwordHash TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS sessions(tokenHash TEXT PRIMARY KEY,adminId INTEGER NOT NULL REFERENCES "${schema}".admins(id),expires BIGINT NOT NULL);
      CREATE TABLE IF NOT EXISTS login_attempts(bucket TEXT PRIMARY KEY,count INTEGER NOT NULL,resetAt BIGINT NOT NULL);
      CREATE TABLE IF NOT EXISTS stories(id TEXT PRIMARY KEY,slug TEXT NOT NULL UNIQUE,title TEXT NOT NULL,excerpt TEXT NOT NULL,body TEXT NOT NULL,topic TEXT NOT NULL CHECK(topic IN ('alone','trust','within','love','family','becoming')),status TEXT NOT NULL CHECK(status IN ('draft','published','archived')),cover TEXT NOT NULL DEFAULT '',coverAlt TEXT NOT NULL DEFAULT '',createdAt TEXT NOT NULL,updatedAt TEXT NOT NULL,publishedAt TEXT,version INTEGER NOT NULL DEFAULT 1,opening INTEGER NOT NULL DEFAULT 0);
      CREATE TABLE IF NOT EXISTS uploads(id TEXT PRIMARY KEY,filename TEXT NOT NULL UNIQUE,width INTEGER NOT NULL,height INTEGER NOT NULL,createdAt TEXT NOT NULL,content BYTEA NOT NULL);
      CREATE TABLE IF NOT EXISTS audit(id BIGSERIAL PRIMARY KEY,event TEXT NOT NULL,storyId TEXT,createdAt TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS migrations(name TEXT PRIMARY KEY);
      CREATE INDEX IF NOT EXISTS stories_status_date ON "${schema}".stories(status,publishedAt DESC);
    `));
    await client.query("COMMIT");
  } catch (error) { await client.query("ROLLBACK"); throw error; }
  finally { client.release(); }
}
async function ready() {
  pool();
  state.jnPostgresReady ??= initialize().catch(error => { state.jnPostgresReady = undefined; throw error; });
  await state.jnPostgresReady;
}
type Database = {
  prepare(source: string): {
    get<T extends QueryResultRow = QueryResultRow>(...values: unknown[]): Promise<T | undefined>;
    all<T extends QueryResultRow = QueryResultRow>(...values: unknown[]): Promise<T[]>;
    run(...values: unknown[]): Promise<{ changes: number }>;
  };
  transaction<T>(work: (tx: Database) => Promise<T>): Promise<T>;
  close(): Promise<void>;
};
function database(client?: PoolClient): Database {
  async function query(source: string, values: unknown[] = []) {
    await ready();
    return (client || pool()).query(sql(source), values);
  }
  return {
    prepare(source: string) {
      return {
        async get<T extends QueryResultRow = QueryResultRow>(...values: unknown[]): Promise<T | undefined> { return (await query(source, values)).rows[0] as T | undefined; },
        async all<T extends QueryResultRow = QueryResultRow>(...values: unknown[]): Promise<T[]> { return (await query(source, values)).rows as T[]; },
        async run(...values: unknown[]) { const result = await query(source, values); return { changes: result.rowCount || 0 }; },
      };
    },
    async transaction<T>(work: (tx: Database) => Promise<T>): Promise<T> {
      await ready();
      const connection = await pool().connect();
      try { await connection.query("BEGIN"); const result = await work(database(connection)); await connection.query("COMMIT"); return result; }
      catch (error) { await connection.query("ROLLBACK"); throw error; }
      finally { connection.release(); }
    },
    async close() { await pool().end(); state.jnPostgres = undefined; state.jnPostgresReady = undefined; },
  };
}
export const db = database;
