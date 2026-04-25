import { authSessionsTable } from '../../../../modules/auth/infrastructure/persistence/postgres/auth-session.schema';
import { usersTable } from '../../../../modules/auth/infrastructure/persistence/postgres/user.schema';


export const schema = {
  authSessionsTable,
  usersTable,
};


export {
  authSessionsTable,
  usersTable,
};
