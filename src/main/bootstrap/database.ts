import { envs } from '../../config';
import { PostgresDatabase } from '../../shared/infrastructure/database/postgres/postgres-database';


export const connectDatabase = async(): Promise<void> => {

  switch ( envs.AUTH_DATABASE_PROVIDER ) {
    case 'postgres':
      await PostgresDatabase.connect();
      return;

    case 'mongo':
      throw new Error('Mongo database bootstrap is not implemented yet');

    case 'sqlite':
      throw new Error('SQLite database bootstrap is not implemented yet');

    case 'memory':
      throw new Error('Memory database bootstrap is not implemented yet');
  }

}
