import { envs } from '../../config';
import { AuthDatasource } from '../../modules/auth/domain/datasources/auth.datasource';
import { PostgresAuthDatasource } from '../../modules/auth/infrastructure/persistence/postgres/postgres-auth.datasource';


export const makeAuthDatasource = (): AuthDatasource => {

  switch ( envs.AUTH_DATABASE_PROVIDER ) {
    case 'postgres':
      return new PostgresAuthDatasource();

    case 'mongo':
      throw new Error('Mongo auth datasource is not implemented yet');

    case 'sqlite':
      throw new Error('SQLite auth datasource is not implemented yet');

    case 'memory':
      throw new Error('Memory auth datasource is not implemented yet');
  }

}
