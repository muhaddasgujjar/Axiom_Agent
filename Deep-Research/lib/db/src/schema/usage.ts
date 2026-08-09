import { date, integer, pgTable, uuid } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const userUsageTable = pgTable("user_usage", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  reportsToday: integer("reports_today").notNull().default(0),
  tokensToday: integer("tokens_today").notNull().default(0),
  lastResetDate: date("last_reset_date", { mode: "string" }).notNull().defaultNow(),
});

export type UserUsage = typeof userUsageTable.$inferSelect;
export type InsertUserUsage = typeof userUsageTable.$inferInsert;
