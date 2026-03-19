import z from "zod"

export const createProjectSchema = z.object({
    name: z.string().min(1, "Project name is required"),
    description: z.string().optional(),
})

export const updateProjectSchema = z.object({
    name: z.string().min(1, "Project name is required").optional(),
    description: z.string().optional(),
})

export type CreateProjectSchema = z.infer<typeof createProjectSchema>;
export type UpdateProjectSchema = z.infer<typeof updateProjectSchema>;
