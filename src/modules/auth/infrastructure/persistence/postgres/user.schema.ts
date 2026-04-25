import { jsonb, pgTable, text, uuid, varchar } from 'drizzle-orm/pg-core';


export const usersTable = pgTable('users', {

  id: uuid('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 150 }).notNull().unique(),
  password: text('password').notNull(),
  img: text('img'),
  roles: jsonb('roles').$type<string[]>().notNull().default(['USER_ROLE']),

});
