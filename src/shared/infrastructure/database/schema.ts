import { authSessionsTable } from '../../../modules/auth/infrastructure/persistence/drizzle/auth-session.schema';
import { usersTable } from '../../../modules/auth/infrastructure/persistence/drizzle/user.schema';


export const schema = {
  authSessionsTable,
  usersTable,
};


export {
  authSessionsTable,
  usersTable,
};
