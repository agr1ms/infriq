import { Request, Response } from "express";
import { runSchemaAgent } from "../agents/schemaAgent.js";
import { GenerateSchemaBody } from "../schemas/schema.schema";
import { RequestWithUser } from "../types/index.js";
import { saveProjectGeneratedSchema } from "../services/project.service.js";

export const generateSchema = async (req: Request, res: Response): Promise<void> => {
  try {
    const { prdText, projectId } = req.body as GenerateSchemaBody;
    const schema = await runSchemaAgent(prdText);

    if (projectId) {
      const user = (req as RequestWithUser).user;
      await saveProjectGeneratedSchema(projectId, user.id, prdText, schema as unknown as Record<string, unknown>);
    }

    res.status(200).json({
      success: true,
      message: "Schema generated successfully",
      schema,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to generate schema";
    if (message === "Project not found") {
      res.status(404).json({
        success: false,
        message: "Project not found",
        error: message,
      });
      return;
    }
    res.status(500).json({
      success: false,
      message: "Schema generation failed",
      error: message,
    });
  }
};
