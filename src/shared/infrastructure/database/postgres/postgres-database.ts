import { sql } from 'drizzle-orm';
import { db } from './db';


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
