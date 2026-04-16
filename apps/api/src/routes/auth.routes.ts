import { Router } from "express"; 
import { loginSchema, registerSchema } from "../schemas/auth.schema";
import { validateBody } from "../middleware/validate";
import { login, register, logout, refresh } from "../controllers/auth.controller";

const authRouter = Router({mergeParams: true});

authRouter.post("/register", validateBody(registerSchema), register);

authRouter.post("/login", validateBody(loginSchema), login);

authRouter.post("/logout", logout);

authRouter.post("/refresh", refresh);

export default authRouter;
