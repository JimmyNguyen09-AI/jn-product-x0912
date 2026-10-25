import { randomBytes, scryptSync } from 'node:crypto';
export async function setAdmin(database, username, password) {
  if (!/^[a-z0-9_.-]{3,64}$/.test(username)) throw new Error('Use a username with 3–64 lowercase letters, numbers, dots, underscores or hyphens.');
  if (password.length < 10 || password.length > 256) throw new Error('Use 10–256 characters for the password.');
  const salt=randomBytes(16).toString('hex');
  const hash=`${salt}:${scryptSync(password,salt,64).toString('hex')}`;
  await database.transaction(async tx=>{
    await tx.prepare('INSERT INTO admins(id,username,passwordHash) VALUES(1,?,?) ON CONFLICT(id) DO UPDATE SET username=EXCLUDED.username,passwordHash=EXCLUDED.passwordHash').run(username,hash);
    await tx.prepare('DELETE FROM sessions').run();
    await tx.prepare('DELETE FROM login_attempts').run();
  });
}
