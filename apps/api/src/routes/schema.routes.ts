import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { validateBody } from "../middleware/validate";
import { generateSchemaBody } from "../schemas/schema.schema";
import { generateSchema } from "../controllers/schema.controller";

const schemaRouter = Router({ mergeParams: true });

schemaRouter.use(authMiddleware);
schemaRouter.post("/generate", validateBody(generateSchemaBody), generateSchema);

export default schemaRouter;
