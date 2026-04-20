import { index, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { usersTable } from './user.schema';

export const authSessionsTable = pgTable('auth_sessions', {

  id: uuid('id').primaryKey(),
  userId: uuid('user_id').notNull().references(() => usersTable.id),
  refreshTokenHash: text('refresh_token_hash').notNull(),
  userAgent: text('user_agent'),
  ip: varchar('ip', { length: 45 }),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),

}, (table) => ({
  userIdIdx: index('auth_sessions_user_id_idx').on(table.userId),
}));
