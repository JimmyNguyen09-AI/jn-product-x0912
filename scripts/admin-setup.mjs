import {createInterface} from 'node:readline/promises';
import {randomBytes,scryptSync} from 'node:crypto';
import './load-env.mjs';
const {db}=await import('../lib/db.ts');
import {Writable} from 'node:stream';
let muted=false;
const output=new Writable({write(chunk,encoding,callback){if(!muted)process.stdout.write(chunk,encoding);callback()}});
output.isTTY=Boolean(process.stdout.isTTY);
const terminal=createInterface({input:process.stdin,output,terminal:Boolean(process.stdin.isTTY)});
terminal.on('SIGINT',()=>{terminal.close();process.exit(1)});
async function secret(prompt){if(!process.stdin.isTTY)throw new Error('Run admin setup in an interactive terminal.');process.stdout.write(prompt);muted=true;try{return await terminal.question('')}finally{muted=false;process.stdout.write('\n')}}

try{const email=(await terminal.question('Admin email: ')).trim().toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw new Error('Enter a valid email.');const password=await secret('Password (at least 14 characters; hidden): ');if(password.length<14||password.length>256)throw new Error('Use 14–256 characters.');const confirmation=await secret('Repeat password: ');if(password!==confirmation)throw new Error('Passwords do not match.');const database=db();if(database.prepare('SELECT id FROM admins WHERE id=1').get()){const answer=await terminal.question('Replace the existing admin and sign out all sessions? Type REPLACE: ');if(answer!=='REPLACE')throw new Error('Setup cancelled.')}const salt=randomBytes(16).toString('hex'),hash=scryptSync(password,salt,64).toString('hex');database.exec('BEGIN IMMEDIATE');try{database.prepare('INSERT INTO admins(id,email,passwordHash) VALUES(1,?,?) ON CONFLICT(id) DO UPDATE SET email=excluded.email,passwordHash=excluded.passwordHash').run(email,`${salt}:${hash}`);database.exec('DELETE FROM sessions;DELETE FROM login_attempts;COMMIT')}catch(e){database.exec('ROLLBACK');throw e}console.log('Admin configured. Sign in at /admin/login. No plaintext password was saved.')}catch(e){console.error(e.message);process.exitCode=1}finally{terminal.close()}
