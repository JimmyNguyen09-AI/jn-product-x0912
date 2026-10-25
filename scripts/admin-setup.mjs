import {createInterface} from 'node:readline/promises';
import {setAdmin} from './admin-account.mjs';
import './load-env.mjs';
const {db}=await import('../lib/postgres.ts');
import {Writable} from 'node:stream';
let muted=false;
const output=new Writable({write(chunk,encoding,callback){if(!muted)process.stdout.write(chunk,encoding);callback()}});
output.isTTY=Boolean(process.stdout.isTTY);
const terminal=createInterface({input:process.stdin,output,terminal:Boolean(process.stdin.isTTY)});
terminal.on('SIGINT',()=>{terminal.close();process.exit(1)});
async function secret(prompt){if(!process.stdin.isTTY)throw new Error('Run admin setup in an interactive terminal.');process.stdout.write(prompt);muted=true;try{return await terminal.question('')}finally{muted=false;process.stdout.write('\n')}}

try {
  const username=(await terminal.question('Admin username: ')).trim().toLowerCase();
  const password=await secret('Password (10-256 characters; hidden): ');
  const confirmation=await secret('Repeat password: ');
  if(password!==confirmation)throw new Error('Passwords do not match.');
  const database=db();
  if(await database.prepare('SELECT id FROM admins WHERE id=1').get()){
    const answer=await terminal.question('Replace the existing admin and sign out all sessions? Type REPLACE: ');
    if(answer!=='REPLACE')throw new Error('Setup cancelled.');
  }
  await setAdmin(database,username,password);
  console.log('Admin configured. Sign in at /admin/login. No plaintext password was saved.');
}catch(e){console.error(e.message);process.exitCode=1}
finally{terminal.close();await db().close()}
