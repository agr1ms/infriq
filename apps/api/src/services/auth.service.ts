import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma/client.js";
import type { JwtPayload } from "../types/index.js";

const jwtSecret = process.env.JWT_ACCESS_SECRET ?? process.env.JWT_SECRET!;
const jwtExpiresIn = process.env.JWT_ACCESS_EXPIRES_IN ?? "7d";

export const parseExpiresIn = (s: string): number => {
    const match = s.match(/^(\d+)([smhd])$/);
    if (!match) return 86400 * 7;
    const [, n, u] = match;
    const num = parseInt(n!, 10);
    const multipliers: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
    return num * (multipliers[u!] ?? 3600);
};

export const signToken = (payload: JwtPayload): string => {
    return jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn } as jwt.SignOptions);
};

export const registerUser = async (data: { email: string; password: string; name?: string | null }) => {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
        throw new Error("Email already registered");
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({
        data: { email: data.email, password: passwordHash, name: data.name ?? null },
        select: { id: true, email: true, name: true },
    });

    const token = signToken({ sub: user.id, email: user.email });

    return { user, token, jwtExpiresIn };
};

export const loginUser = async (data: { email: string; password: string }) => {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user || !(await bcrypt.compare(data.password, user.password))) {
        throw new Error("Invalid email or password");
    }

    const token = signToken({ sub: user.id, email: user.email });

    return {
        user: { id: user.id, email: user.email, name: user.name },
        token,
        jwtExpiresIn
    };
};
