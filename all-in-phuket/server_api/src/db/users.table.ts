import { bigserial, boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const users_table = pgTable('users', {
  id: bigserial('id', { mode: 'number' }).primaryKey().notNull(),

  email: text('email').unique().notNull(),
  password: text('password').notNull(),

  emailVerificationToken: text('email_verification_token'),
  emailVerifiedAt: timestamp('email_verified_at', { withTimezone: true, mode: 'string' }),

  isProfileComplete: boolean('is_profile_complete').default(false).notNull(),

  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  profilePicture: text('profile_picture'),

  refreshToken: text('refresh_token'),

  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow(),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true, mode: 'string' }),
});
