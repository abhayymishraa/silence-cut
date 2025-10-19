import { relations, sql } from "drizzle-orm";
import { index, pgTableCreator, primaryKey, unique } from "drizzle-orm/pg-core";
import { type AdapterAccount } from "@auth/core/adapters";

/**
 * Multi-tenant video processing SaaS schema
 */
export const createTable = pgTableCreator((name) => `video_processor_${name}`);

// Users table (NextAuth compatible)
export const users = createTable("user", (d) => ({
  id: d
    .varchar({ length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: d.varchar({ length: 255 }),
  email: d.varchar({ length: 255 }).notNull(),
  emailVerified: d
    .timestamp({
      mode: "date",
      withTimezone: true,
    })
    .default(sql`CURRENT_TIMESTAMP`),
  image: d.varchar({ length: 255 }),
  createdAt: d
    .timestamp({ withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
}));

// Workspaces table (multi-tenancy)
export const workspaces = createTable(
  "workspace",
  (d) => ({
    id: d
      .varchar({ length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: d.varchar({ length: 255 }).notNull(),
    slug: d.varchar({ length: 255 }).notNull(),
    logoUrl: d.varchar({ length: 500 }),
    primaryColor: d.varchar({ length: 7 }).default("#3b82f6"), // hex color
    customDomain: d.varchar({ length: 255 }),
    credits: d.integer().default(1).notNull(), // 1 free credit
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    unique("workspace_slug_unique").on(t.slug),
    unique("workspace_custom_domain_unique").on(t.customDomain),
    index("workspace_slug_idx").on(t.slug),
    index("workspace_custom_domain_idx").on(t.customDomain),
  ]
);

// Memberships table (user-workspace relationship)
export const memberships = createTable(
  "membership",
  (d) => ({
    id: d
      .varchar({ length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    workspaceId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    role: d.varchar({ length: 50 }).default("member").notNull(), // owner, admin, member
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  }),
  (t) => [
    unique("membership_user_workspace_unique").on(t.userId, t.workspaceId),
    index("membership_user_id_idx").on(t.userId),
    index("membership_workspace_id_idx").on(t.workspaceId),
  ]
);

// Video jobs table
export const videoJobs = createTable(
  "video_job",
  (d) => ({
    id: d
      .varchar({ length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    workspaceId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    originalUrl: d.varchar({ length: 500 }).notNull(),
    processedUrl: d.varchar({ length: 500 }),
    status: d
      .varchar({ length: 50 })
      .default("queued")
      .notNull(), // queued, processing, completed, failed
    duration: d.integer(), // duration in seconds
    errorMessage: d.text(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    completedAt: d.timestamp({ withTimezone: true }),
  }),
  (t) => [
    index("video_job_workspace_id_idx").on(t.workspaceId),
    index("video_job_user_id_idx").on(t.userId),
    index("video_job_status_idx").on(t.status),
    index("video_job_created_at_idx").on(t.createdAt),
  ]
);

// Payments table
export const payments = createTable(
  "payment",
  (d) => ({
    id: d
      .varchar({ length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    workspaceId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    stripeSessionId: d.varchar({ length: 255 }).notNull(),
    amount: d.integer().notNull(), // amount in cents
    credits: d.integer().notNull(),
    status: d.varchar({ length: 50 }).default("pending").notNull(), // pending, completed, failed
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    completedAt: d.timestamp({ withTimezone: true }),
  }),
  (t) => [
    unique("payment_stripe_session_id_unique").on(t.stripeSessionId),
    index("payment_workspace_id_idx").on(t.workspaceId),
    index("payment_status_idx").on(t.status),
  ]
);

// NextAuth tables
export const accounts = createTable(
  "account",
  (d) => ({
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: d.varchar({ length: 255 }).$type<AdapterAccount["type"]>().notNull(),
    provider: d.varchar({ length: 255 }).notNull(),
    providerAccountId: d.varchar({ length: 255 }).notNull(),
    refresh_token: d.text(),
    access_token: d.text(),
    expires_at: d.integer(),
    token_type: d.varchar({ length: 255 }),
    scope: d.varchar({ length: 255 }),
    id_token: d.text(),
    session_state: d.varchar({ length: 255 }),
  }),
  (t) => [
    primaryKey({ columns: [t.provider, t.providerAccountId] }),
  ]
);

export const sessions = createTable("session", (d) => ({
  sessionToken: d.varchar({ length: 255 }).notNull().primaryKey(),
  userId: d
    .varchar({ length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: d.timestamp({ withTimezone: true }).notNull(),
}));

export const verificationTokens = createTable(
  "verification_token",
  (d) => ({
    identifier: d.varchar({ length: 255 }).notNull(),
    token: d.varchar({ length: 255 }).notNull(),
    expires: d.timestamp({ withTimezone: true }).notNull(),
  }),
  (t) => [primaryKey({ columns: [t.identifier, t.token] })]
);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  memberships: many(memberships),
  videoJobs: many(videoJobs),
}));

export const workspacesRelations = relations(workspaces, ({ many }) => ({
  memberships: many(memberships),
  videoJobs: many(videoJobs),
  payments: many(payments),
}));

export const membershipsRelations = relations(memberships, ({ one }) => ({
  user: one(users, {
    fields: [memberships.userId],
    references: [users.id],
  }),
  workspace: one(workspaces, {
    fields: [memberships.workspaceId],
    references: [workspaces.id],
  }),
}));

export const videoJobsRelations = relations(videoJobs, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [videoJobs.workspaceId],
    references: [workspaces.id],
  }),
  user: one(users, {
    fields: [videoJobs.userId],
    references: [users.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [payments.workspaceId],
    references: [workspaces.id],
  }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));
