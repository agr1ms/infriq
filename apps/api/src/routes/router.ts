import { Router } from "express";
import authRouter from "./auth.routes.js";

const router = Router({ mergeParams: true });

router.use("/auth", authRouter);

export default router;
