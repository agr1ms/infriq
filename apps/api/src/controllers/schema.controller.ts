import { Request, Response } from "express";
import { runSchemaAgent } from "../agents/schemaAgent.js";
import { GenerateSchemaBody } from "../schemas/schema.schema";

export const generateSchema = async (req: Request, res: Response): Promise<void> => {
  try {
    const { prdText } = req.body as GenerateSchemaBody;
    const schema = await runSchemaAgent(prdText);

    res.status(200).json({
      success: true,
      message: "Schema generated successfully",
      schema,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to generate schema";
    res.status(500).json({
      success: false,
      message: "Schema generation failed",
      error: message,
    });
  }
};
