import {backup} from 'node:sqlite';
import {mkdir,cp} from 'node:fs/promises';
import path from 'node:path';
import './load-env.mjs';
const {db,dataDirectory}=await import('../lib/db.ts');
const stamp=new Date().toISOString().replace(/[:.]/g,'-');
const destination=path.resolve(process.env.BACKUP_DIR||'backups',stamp);
await mkdir(destination,{recursive:true,mode:0o700});
await backup(db(),path.join(destination,'journal.sqlite'));
try{await cp(path.join(dataDirectory,'uploads'),path.join(destination,'uploads'),{recursive:true,errorOnExist:true})}catch(e){if(e.code!=='ENOENT')throw e}
console.log(`Backup created: ${destination}`);
db().close();
