import type { NextFunction, Request, Response } from "express";
import { sql } from "drizzle-orm";
import { db, userUsageTable, type UserUsage } from "@workspace/db";
import { logger } from "../lib/logger";

export const DAILY_REPORT_LIMIT = 5;

declare global {
  namespace Express {
    interface Request {
      usage?: UserUsage;
    }
  }
}

function utcToday(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function checkDailyLimits(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  // Lazy-create the usage row for any user that predates the quota table
  // (seeded/test/legacy accounts). UPSERT with ON CONFLICT DO NOTHING so two
  // rapid requests cannot race into a unique-constraint violation on user_id.
  await db
    .insert(userUsageTable)
    .values({ userId, lastResetDate: utcToday() })
    .onConflictDoNothing({ target: userUsageTable.userId });

  // Atomic compare-and-set reset: only zeroes the counters when the stored
  // reset date differs from today's UTC date, so concurrent requests each
  // apply the reset exactly once without clobbering same-day increments.
  const today = utcToday();
  await db
    .update(userUsageTable)
    .set({ reportsToday: 0, tokensToday: 0, lastResetDate: today })
    .where(sql`${userUsageTable.userId} = ${userId} AND ${userUsageTable.lastResetDate} <> ${today}`);

  const [usage] = await db.select().from(userUsageTable).where(sql`${userUsageTable.userId} = ${userId}`).limit(1);
  if (!usage) {
    res.status(500).json({ error: "Could not load usage record" });
    return;
  }

  if (usage.reportsToday >= DAILY_REPORT_LIMIT) {
    logger.warn({ userId, reportsToday: usage.reportsToday, dailyLimit: DAILY_REPORT_LIMIT }, "429 daily research limit reached in checkDailyLimits; rejected before contacting the Python backend");
    res.status(429).json({ error: "Daily limit reached. Resets at midnight UTC." });
    return;
  }

  req.usage = usage;
  next();
}
