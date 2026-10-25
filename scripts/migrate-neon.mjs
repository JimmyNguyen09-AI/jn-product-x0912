import './load-env.mjs';
import { DatabaseSync } from 'node:sqlite';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
const {db}=await import('../lib/postgres.ts');
const dataDirectory=path.resolve(process.env.DATA_DIR||'data');
const database=db();
const source=path.join(dataDirectory,'journal.sqlite');
try {
  if (!existsSync(source)) {await database.prepare('SELECT 1').get();console.log('PostgreSQL schema ready; no local database to import.');}
  else if (await database.prepare('SELECT name FROM migrations WHERE name=?').get('sqlite-import-v1')) console.log('Local data was already imported.');
  else {
    const local=new DatabaseSync(source,{readOnly:true});
    try {
      const stories=local.prepare('SELECT * FROM stories').all();
      const uploads=local.prepare('SELECT * FROM uploads').all();
      const assets=await Promise.all(uploads.map(async row=>({...row,content:await readFile(path.join(dataDirectory,'uploads',row.filename))})));
      await database.transaction(async tx=>{
        await tx.prepare('SELECT pg_advisory_xact_lock(hashtext(?))').get('jn-sqlite-import');
        if(await tx.prepare('SELECT name FROM migrations WHERE name=?').get('sqlite-import-v1'))return;
        for(const row of stories) {
          const existing=await tx.prepare('SELECT * FROM stories WHERE slug=? OR id=?').get(row.slug,row.id);
          if(existing) {
            if(existing.body!==row.body||existing.title!==row.title||existing.status!==row.status)throw new Error('Conflicting story found; import rolled back without overwriting it.');
            continue;
          }
          const fields=['id','slug','title','excerpt','body','topic','status','cover','coverAlt','createdAt','updatedAt','publishedAt','version','opening'];
          await tx.prepare(`INSERT INTO stories(${fields.join(',')}) VALUES(${fields.map(()=>'?').join(',')})`).run(...fields.map(key=>row[key]));
        }
        for(const row of assets)await tx.prepare('INSERT INTO uploads(id,filename,width,height,createdAt,content) VALUES(?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING').run(row.id,row.filename,row.width,row.height,row.createdAt,row.content);
        for(const row of local.prepare('SELECT event,storyId,createdAt FROM audit').all())await tx.prepare('INSERT INTO audit(event,storyId,createdAt) VALUES(?,?,?)').run(row.event,row.storyId,row.createdAt);
        await tx.prepare('INSERT INTO migrations(name) VALUES(?)').run('sqlite-import-v1');
        await tx.prepare('INSERT INTO migrations(name) VALUES(?) ON CONFLICT DO NOTHING').run('opening-v1');
      });
      console.log(`Imported/verified ${stories.length} stories and ${uploads.length} images. Original SQLite database retained. Old credentials and sessions were not imported.`);
    } finally {local.close();}
  }
} finally {await database.close();}
