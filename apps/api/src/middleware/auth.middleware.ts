import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma/client.js";
import { JwtPayload, RequestWithUser } from "../types/index.js";

const jwtSecret = process.env.JWT_ACCESS_SECRET ?? process.env.JWT_SECRET!;

export async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  let token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token && req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    res.status(401).json({ error: "Missing or invalid authorization header/cookie" });
    return;
  }

  try {
    const decoded = jwt.verify(token, jwtSecret as jwt.Secret) as unknown as JwtPayload;

    const user = await prisma.user.findUnique({ where: { id: decoded.sub } });
    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }

    (req as RequestWithUser).user = user;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
