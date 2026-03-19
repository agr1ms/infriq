import { Request, Response } from "express";
import { createProjectSchema, updateProjectSchema } from "../schemas/project.schema";
import { RequestWithUser } from "../types";
import { createProjectService, deleteProjectService, getAllProjectsService, getProjectByIdService, updateProjectService } from "../services/project.service";

export const createProject = async (req: Request, res: Response): Promise<void> => {
    const request = req as RequestWithUser;
    try {
        const userId = request.user.id;
        const project = await createProjectService({ ...request.body, userId });

        res.status(201).json({
            success: true,
            message: "Project created successfully",
            project
        });

    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Failed to create project",
            error: error.message
        })
    }
}

export const getAllProjects = async (req: Request, res: Response): Promise<void> => {
    const request = req as RequestWithUser;
    try {
        const userId = request.user.id;

        const projects = await getAllProjectsService(userId);

        res.status(200).json({
            success: true,
            message: "Projects retrieved successfully",
            projects
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve projects",
            error: error.message
        })
    }

}

export const getProjectById = async (req: Request, res: Response): Promise<void> => {
    const request = req as RequestWithUser;
    try {
        const { id } = request.params;
        const userId = request.user.id;
        const project = await getProjectByIdService(id, userId);
        res.status(200).json({
            success: true,
            message: "Project retrieved successfully",
            project
        })
    } catch (error: any) {
        if (error.message === "Project not found") {
            res.status(404).json({
                success: false,
                message: "Project not found"
            });
        } else {
            res.status(500).json({
                success: false,
                message: "Failed to retrieve project",
                error: error.message
            });
        }
    }
}

export const updateProject = async (req: Request, res: Response): Promise<void> => {
    const request = req as RequestWithUser;
    try {
        const { id } = request.params;
        const userId = request.user.id;
        const project = await updateProjectService(id, userId, request.body);

        res.status(200).json({
            success: true,
            message: "Project updated successfully",
            project
        })

    } catch (error: any) {
        if (error.message === "Project not found") {
            res.status(404).json({
                success: false,
                message: "Project not found",
            })
        } else {
            res.status(500).json({
                success: false,
                message: "Failed to update project",
                error: error.message
            })
        }
    }

}

export const deleteProject = async (req: Request, res: Response): Promise<void> => {
    const request = req as RequestWithUser;
    try {
        const { id } = request.params;
        const userId = request.user.id;

        const project = await deleteProjectService(id, userId);

        res.status(200).json({
            success: true,
            message: "Project deleted successfully",
            project
        });

    } catch (error: any) {
        if (error.message === "Project not found") {
            res.status(404).json({
                success: false,
                message: "Project not found",
            })
        } else {
            res.status(500).json({
                success: false,
                message: "Failed to delete project",
                error: error.message
            })
        }
    }
}