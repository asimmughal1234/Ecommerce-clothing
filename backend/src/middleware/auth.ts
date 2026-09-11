import { NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import { verifyToken } from "../utils/jwt";
import { ApiError } from "../utils/apiError";

declare global {
  namespace Express {
    interface Request {
      user?: { userId: string; role: "CUSTOMER" | "ADMIN" };
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.[env.cookieName] ?? extractBearer(req);
  if (!token) {
    return next(new ApiError(401, "You must be logged in to do that."));
  }
  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch {
    next(new ApiError(401, "Your session has expired. Please log in again."));
  }
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== "ADMIN") {
    return next(new ApiError(403, "Admin access required."));
  }
  next();
}

export function attachUserIfPresent(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.[env.cookieName] ?? extractBearer(req);
  if (token) {
    try {
      req.user = verifyToken(token);
    } catch {
      // ignore invalid token for optional-auth routes
    }
  }
  next();
}

function extractBearer(req: Request): string | undefined {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice(7);
  return undefined;
}
