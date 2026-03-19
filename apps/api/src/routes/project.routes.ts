import { Router } from "express";
import { validateBody } from "../middleware/validate";
import { createProjectSchema, updateProjectSchema } from "../schemas/project.schema";
import { createProject, deleteProject, getAllProjects, getProjectById, updateProject } from "../controllers/project.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const projectRoute = Router({ mergeParams: true });

projectRoute.use(authMiddleware);

projectRoute.post("/create", validateBody(createProjectSchema), createProject);
projectRoute.get("/all", getAllProjects);
projectRoute.get("/:id", getProjectById);
projectRoute.put("/:id", validateBody(updateProjectSchema), updateProject);
projectRoute.delete("/:id", deleteProject);

export default projectRoute;
