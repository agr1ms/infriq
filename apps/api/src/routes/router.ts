import { Router } from "express";
import authRouter from "./auth.routes.js";
import projectRoute from "./project.routes.js";

const router = Router({ mergeParams: true });

router.use("/auth", authRouter);
router.use("/projects", projectRoute)

export default router;
