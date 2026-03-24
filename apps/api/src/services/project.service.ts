import { prisma } from "../prisma/client";
import { CreateProjectSchema, UpdateProjectSchema } from "../schemas/project.schema";

export const createProjectService = async (data: CreateProjectSchema & { userId: string }) => {
    const { name, description, userId } = data;

    const project = await prisma.project.create({
        data: {
            name: name,
            description: description ?? null,
            userId: userId
        },
        select: {
            id: true,
            name: true,
            description: true,
        }
    });

    return project;

}

export const getAllProjectsService = async (userId: string) => {
    const projects = await prisma.project.findMany({
        where: {
            userId: userId
        },
        select: {
            id: true,
            name: true,
            description: true,
            createdAt: true,
        },
        orderBy: {
            updatedAt: "desc"
        }
    });
    return projects;
}

export const getProjectByIdService = async (id: string, userId: string) => {
    const project = await prisma.project.findFirst({
        where: {
            id: id,
            userId: userId
        },
    });
    if (!project) {
        throw new Error("Project not found");
    }
    return project;
}

export const updateProjectService = async (id: string, userId: string, data: UpdateProjectSchema) => {
    const { name, description } = data;

    const project = await prisma.project.findFirst({
        where: {
            id: id,
            userId: userId
        }
    });
    if (!project) {
        throw new Error("Project not found");
    }

    const updatedProject = await prisma.project.update({
        where: {
            id: id,
        },
        data: {
            name: name ?? project.name,
            description: description ?? project.description,
        },
        select: {
            id: true,
            name: true,
            description: true,
        }
    });

    return updatedProject;
}

export const deleteProjectService = async (id: string, userId: string) => {
    const project = await prisma.project.findFirst({
        where: {
            id: id,
            userId: userId
        },
    });
    if (!project) {
        throw new Error("Project not found");
    }

    await prisma.project.delete({
        where: {
            id: id,
        }
    });

    return project;

}
