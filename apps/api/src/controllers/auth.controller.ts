import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../prisma/client.js";
import type { JwtPayload } from "../types/index.js";
import { loginSchema, registerSchema } from "../schemas/auth.schema.js";

const jwtSecret = process.env.JWT_ACCESS_SECRET ?? process.env.JWT_SECRET!;
const jwtExpiresIn = process.env.JWT_ACCESS_EXPIRES_IN ?? "7d";

function signToken(payload: JwtPayload): string {
    return jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn } as jwt.SignOptions);
}

function parseExpiresIn(s: string): number {
    const match = s.match(/^(\d+)([smhd])$/);
    if (!match) return 86400 * 7;
    const [, n, u] = match;
    const num = parseInt(n!, 10);
    const multipliers: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
    return num * (multipliers[u!] ?? 3600);
}

export async function register(req: Request, res: Response): Promise<void> {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: "Validation failed", details: parsed.error.flatten().fieldErrors });
        return;
    }
    const { email, password, name } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        res.status(409).json({ error: "Email already registered" });
        return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
        data: { email, password: passwordHash, name: name ?? null },
        select: { id: true, email: true, name: true },
    });

    const token = signToken({ sub: user.id, email: user.email });

    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: parseExpiresIn(jwtExpiresIn) * 1000,
    });

    res.status(201).json({
        token,
        user: { id: user.id, email: user.email, name: user.name },
    });
}

export async function login(req: Request, res: Response): Promise<void> {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: "Validation failed", details: parsed.error.flatten().fieldErrors });
        return;
    }
    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
    }

    const token = signToken({ sub: user.id, email: user.email });

    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: parseExpiresIn(jwtExpiresIn) * 1000,
    });

    res.json({
        token,
        user: { id: user.id, email: user.email, name: user.name },
    });
}

export async function logout(_req: Request, res: Response): Promise<void> {
    res.clearCookie("token");
    res.json({ message: "Successfully logged out" });
}
