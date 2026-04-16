import { Request, Response } from "express";
import { loginSchema, registerSchema } from "../schemas/auth.schema.js";
import { registerUser, loginUser, parseExpiresIn, signToken, verifyToken } from "../services/auth.service.js";
import { prisma } from "../prisma/client.js";

const jwtExpiresIn = process.env.JWT_ACCESS_EXPIRES_IN ?? "7d";

export const register = async (req: Request, res: Response): Promise<void> => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: "Validation failed", details: parsed.error.flatten().fieldErrors });
        return;
    }

    try {
        const { user, token } = await registerUser(parsed.data);

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: parseExpiresIn(jwtExpiresIn) * 1000,
        });

        res.status(201).json({
            token,
            user,
        });
    } catch (err: any) {
        if (err.message === "Email already registered") {
            res.status(409).json({ error: err.message });
        } else {
            res.status(500).json({ error: "Register failed" });
        }
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: "Validation failed", details: parsed.error.flatten().fieldErrors });
        return;
    }

    try {
        const { user, token } = await loginUser(parsed.data);

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: parseExpiresIn(jwtExpiresIn) * 1000,
        });

        res.json({
            token,
            user,
        });
    } catch (err: any) {
        if (err.message === "Invalid email or password") {
            res.status(401).json({ error: err.message });
        } else {
            res.status(500).json({ error: "Login failed" });
        }
    }
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
    res.clearCookie("token");
    res.json({ message: "Successfully logged out" });
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
    const token = req.cookies?.token;
    if (!token) {
        res.status(401).json({ error: "No token to refresh" });
        return;
    }

    try {
        const decoded = verifyToken(token);
        const user = await prisma.user.findUnique({ where: { id: decoded.sub } });
        if (!user) {
            res.status(401).json({ error: "User not found" });
            return;
        }

        const newToken = signToken({ sub: user.id, email: user.email });

        res.cookie("token", newToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: parseExpiresIn(jwtExpiresIn) * 1000,
        });

        res.json({
            token: newToken,
            user: { id: user.id, email: user.email, name: user.name },
        });
    } catch {
        res.status(401).json({ error: "Invalid or expired session" });
    }
};
