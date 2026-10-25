import './load-env.mjs';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
const {db}=await import('../lib/postgres.ts');
const database=db();
try {
  const snapshot=await database.transaction(async tx=>{
    await tx.prepare('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ, READ ONLY').run();
    const tables={};
    for(const table of ['admins','stories','uploads','audit','migrations']) {
      tables[table]=await tx.prepare(`SELECT * FROM ${table}`).all();
      if(table==='uploads')tables[table]=tables[table].map(row=>({...row,content:row.content.toString('base64')}));
    }
    return {format:'jn-postgres-v1',createdAt:new Date().toISOString(),tables};
  });
  const directory=path.resolve(process.env.BACKUP_DIR||'backups');
  await mkdir(directory,{recursive:true,mode:0o700});
  const filename=path.join(directory,`journal-${Date.now()}.json`);
  await writeFile(filename,JSON.stringify(snapshot),{flag:'wx',mode:0o600});
  console.log('Private PostgreSQL snapshot created, including image bytes. Sessions excluded.');
}finally{await database.close();}
