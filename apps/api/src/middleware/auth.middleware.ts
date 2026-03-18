import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma/client.js";
import { JwtPayload } from "../types/index.js";

const accessSecret = process.env.JWT_ACCESS_SECRET;
if (!accessSecret) throw new Error("JWT_ACCESS_SECRET is required");

export async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401).json({ error: "Missing or invalid authorization header" });
    return;
  }

  try {
    const decoded = jwt.verify(token, accessSecret as jwt.Secret) as unknown as JwtPayload;
    if (decoded.type !== "access") {
      res.status(401).json({ error: "Invalid token type" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.sub } });
    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }

    (req as Request & { user: typeof user }).user = user;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
