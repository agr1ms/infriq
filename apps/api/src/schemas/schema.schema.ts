import { z } from "zod";

export const generateSchemaBody = z.object({
  prdText: z.string().min(20, "PRD text must be at least 20 characters"),
  projectId: z.string().cuid().optional(),
});

export type GenerateSchemaBody = z.infer<typeof generateSchemaBody>;
