import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { User } from "@workspace/db";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

const JWT_SECRET = process.env["JWT_SECRET"] ?? "dev-secret-change-me";
const JWT_EXPIRES_IN = process.env["JWT_EXPIRES_IN"] ?? "7d";

export function signToken(user: Pick<User, "id" | "email">): string {
  return jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
}

export function verifyToken(token: string): { sub: string; email: string } | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (typeof payload === "object" && payload !== null && typeof payload.sub === "string") {
      return { sub: payload.sub, email: String(payload.email ?? "") };
    }
    return null;
  } catch {
    return null;
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;
  const payload = token ? verifyToken(token) : null;
  if (!payload) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  req.userId = payload.sub;
  next();
}
