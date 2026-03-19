import type { Request } from "express";
import type { User } from "@prisma/client";

export interface JwtPayload {
  sub: string;
  email: string;
}

export interface RequestWithUser extends Request {
  user: User;
}
