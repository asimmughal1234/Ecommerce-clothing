import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { env } from "../config/env";
import { signToken } from "../utils/jwt";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const cookieOptions = {
  httpOnly: true,
  secure: env.nodeEnv === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
};

function publicUser(user: { id: string; name: string; email: string; role: string }) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const data = registerSchema.parse(req.body);

  const existing = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
  if (existing) {
    throw new ApiError(409, "An account with that email already exists.");
  }

  const passwordHash = await bcrypt.hash(data.password, 12);
  const user = await prisma.user.create({
    data: { name: data.name, email: data.email.toLowerCase(), passwordHash },
  });

  const token = signToken({ userId: user.id, role: user.role });
  res.cookie(env.cookieName, token, cookieOptions);
  res.status(201).json({ user: publicUser(user), token });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const data = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
  if (!user) throw new ApiError(401, "Incorrect email or password.");

  const valid = await bcrypt.compare(data.password, user.passwordHash);
  if (!valid) throw new ApiError(401, "Incorrect email or password.");

  const token = signToken({ userId: user.id, role: user.role });
  res.cookie(env.cookieName, token, cookieOptions);
  res.json({ user: publicUser(user), token });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie(env.cookieName, { path: "/" });
  res.json({ success: true });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Not authenticated.");
  const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
  if (!user) throw new ApiError(404, "User not found.");
  res.json({ user: publicUser(user) });
});
