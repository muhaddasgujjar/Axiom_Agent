import { jsonb, integer, pgTable, real, text, timestamp, uuid } from "drizzle-orm/pg-core";

export type ResearchAgent = {
  name: string;
  detail: string;
  count: string;
  status: "queued" | "active" | "done";
  progress: number;
};

export type ResearchSource = {
  type: string;
  title: string;
  source: string;
  progress: number;
};

export type ResearchRecent = {
  id: string;
  title: string;
  meta: string;
  status: string;
};

export const researchTable = pgTable("research", {
  id: text("id").primaryKey(),
  query: text("query").notNull(),
  status: text("status").notNull(),
  progress: integer("progress").notNull().default(0),
  elapsedMinutes: integer("elapsed_minutes").notNull().default(0),
  verificationScore: integer("verification_score").notNull().default(0),
  sourcesCount: integer("sources_count").notNull().default(0),
  claimsChecked: integer("claims_checked").notNull().default(0),
  agents: jsonb("agents").$type<ResearchAgent[]>().notNull(),
  sources: jsonb("sources").$type<ResearchSource[]>().notNull(),
  summary: text("summary").notNull(),
  report: text("report").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  userId: uuid("user_id"),
});

export type Research = typeof researchTable.$inferSelect;
export type InsertResearch = typeof researchTable.$inferInsert;