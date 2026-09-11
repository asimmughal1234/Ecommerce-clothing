import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/apiError";
import { ZodError } from "zod";

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Validation failed.",
      details: err.errors.map((e) => ({ path: e.path.join("."), message: e.message })),
    });
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ error: err.message, details: err.details });
  }

  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Something went wrong on our end. Please try again." });
}
