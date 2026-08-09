import { Router, type IRouter } from "express";
import bcrypt from "bcrypt";
import { and, eq, ne } from "drizzle-orm";
import { db, usersTable, userUsageTable } from "@workspace/db";
import {
  AuthLoginBody,
  AuthLoginResponse,
  AuthMeResponse,
  AuthRegisterBody,
  AuthRegisterResponse,
  AuthUpdateProfileBody,
} from "@workspace/api-zod";
import { signToken, requireAuth } from "../lib/auth";
import { logger } from "../lib/logger";

const router: IRouter = Router();
const BCRYPT_ROUNDS = 10;

function publicUser(row: typeof usersTable.$inferSelect) {
  return { id: row.id, email: row.email, createdAt: row.createdAt.toISOString() };
}

router.post("/register", async (req, res): Promise<void> => {
  const parsed = AuthRegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const email = parsed.data.email.trim().toLowerCase();
  const [existing] = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (existing) {
    res.status(409).json({ error: "An account with this email already exists." });
    return;
  }
  const passwordHash = await bcrypt.hash(parsed.data.password, BCRYPT_ROUNDS);
  const row = await db.transaction(async (tx) => {
    const [created] = await tx.insert(usersTable).values({ email, passwordHash }).returning();
    await tx.insert(userUsageTable).values({ userId: created.id });
    return created;
  });
  const user = publicUser(row);
  const token = signToken(row);
  req.log.info({ userId: row.id }, "Registered a new user");
  res.status(201).json(AuthRegisterResponse.parse({ token, user }));
});

router.post("/login", async (req, res): Promise<void> => {
  const parsed = AuthLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const email = parsed.data.email.trim().toLowerCase();
  const [row] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  const valid = row ? await bcrypt.compare(parsed.data.password, row.passwordHash) : false;
  if (!row || !valid) {
    res.status(401).json({ error: "Invalid email or password." });
    return;
  }
  const user = publicUser(row);
  const token = signToken(row);
  req.log.info({ userId: row.id }, "User signed in");
  res.json(AuthLoginResponse.parse({ token, user }));
});

router.get("/me", requireAuth, async (req, res): Promise<void> => {
  const [row] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!)).limit(1);
  if (!row) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  res.json(AuthMeResponse.parse(publicUser(row)));
});

router.patch("/profile", requireAuth, async (req, res): Promise<void> => {
  const parsed = AuthUpdateProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [current] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!)).limit(1);
  if (!current) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const email = parsed.data.email ? parsed.data.email.trim().toLowerCase() : current.email;
  if (email !== current.email) {
    const [taken] = await db.select({ id: usersTable.id }).from(usersTable).where(and(eq(usersTable.email, email), ne(usersTable.id, current.id))).limit(1);
    if (taken) {
      res.status(409).json({ error: "An account with this email already exists." });
      return;
    }
  }
  const passwordHash = parsed.data.password ? await bcrypt.hash(parsed.data.password, BCRYPT_ROUNDS) : current.passwordHash;
  const [updated] = await db.update(usersTable).set({ email, passwordHash }).where(eq(usersTable.id, current.id)).returning();
  req.log.info({ userId: updated.id }, "Updated user profile");
  res.json(AuthMeResponse.parse(publicUser(updated)));
});

// Dev convenience: idempotently creates a test user so the workspace can be
// exercised immediately. Remove before production.
router.post("/seed", async (req, res): Promise<void> => {
  const email = "test@axiom.com";
  const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (existing) {
    const token = signToken(existing);
    res.json(AuthLoginResponse.parse({ token, user: publicUser(existing) }));
    return;
  }
  const passwordHash = await bcrypt.hash("password123", BCRYPT_ROUNDS);
  const row = await db.transaction(async (tx) => {
    const [created] = await tx.insert(usersTable).values({ email, passwordHash }).returning();
    await tx.insert(userUsageTable).values({ userId: created.id });
    return created;
  });
  const token = signToken(row);
  req.log.info({ userId: row.id }, "Seeded test user");
  res.status(201).json(AuthRegisterResponse.parse({ token, user: publicUser(row) }));
});

export default router;
