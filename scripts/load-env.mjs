import {existsSync} from 'node:fs';
import {loadEnvFile} from 'node:process';
// Match the documented local setup; environment variables always take precedence.
for(const filename of ['.env.local','.env'])if(existsSync(filename))loadEnvFile(filename);
