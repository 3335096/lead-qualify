import type { NextFunction, Request, Response } from "express";
import { maskPII } from "@lead/shared";

export function piiSafeLogger(req: Request, _res: Response, next: NextFunction): void {
  const body = req.body ? JSON.stringify(req.body) : "";
  const safeBody = maskPII(body);
  const userAgent = req.get("user-agent") ?? "unknown";
  const message = `${req.method} ${req.originalUrl} ua=${userAgent} body=${safeBody}`;
  console.log(message);
  next();
}
