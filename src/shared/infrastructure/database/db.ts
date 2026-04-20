import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { envs } from '../../../config';
import { schema } from './schema';


const pool = new Pool({
  connectionString: envs.DATABASE_URL,
});


export const db = drizzle(pool, { schema });


export class PostgresDatabase {

  static async connect() {

    try {

      await db.execute(sql`select 1`);
      console.log('Postgres connected');
      return true;

    } catch (error) {
      console.log(error);
      throw new Error('Error connecting to postgres');
    }

  }


}
