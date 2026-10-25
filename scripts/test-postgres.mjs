import {PGlite} from '@electric-sql/pglite';
import {PGLiteSocketServer} from '@electric-sql/pglite-socket';
// An isolated PostgreSQL engine for QA. Never reads .env or touches Neon.
export async function startTestPostgres() {
  const engine=await PGlite.create();
  const server=new PGLiteSocketServer({db:engine,host:'127.0.0.1',port:0,maxConnections:20});
  await server.start();
  const address=server.getServerConn();
  process.env.DATABASE_URL=`postgresql://postgres:postgres@${address}/postgres?sslmode=disable`;
  process.env.DATABASE_SCHEMA='jn_test';
  return async()=>{await server.stop();await engine.close();};
}
