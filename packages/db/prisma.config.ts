import { join } from 'node:path';
import { env } from 'node:process';
import dotenv from 'dotenv';
import { defineConfig } from 'prisma/config';

let envPath = '.env';
if (env.MODE === 'test') {
  envPath = '.env.test';
}
else if (env.MODE === 'production') {
  envPath = '.env.production';
}
dotenv.config({ path: envPath });
dotenv.config({ path: `${envPath}.local` });

console.log(env.DATABASE_URL);

export default defineConfig({
  schema: join('prisma', 'schema'),
  migrations: {
    path: join('prisma', 'migrations'),
  },
  views: {
    path: join('prisma', 'views'),
  },
  typedSql: {
    path: join('prisma', 'queries'),
  },
});
