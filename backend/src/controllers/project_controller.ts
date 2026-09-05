import { Response } from "express";
import { z } from "zod";
import { AuthRequest } from "../middleware/auth_middleware";
import {
  createProject,
  getAllProjects,
  updateProject,
  deleteProject,
} from "../services/project_service";

const createSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
});

export async function create(req: AuthRequest, res: Response) {
  try {
    const input = createSchema.parse(req.body);
    const project = await createProject(input);
    res.status(201).json(project);
  } catch (err: any) {
    res.status(400).json({ error: err.message ?? "Failed to create project" });
  }
}

export async function list(req: AuthRequest, res: Response) {
  try {
    const projects = await getAllProjects();
    res.json(projects);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch projects" });
  }
}

export async function update(req: AuthRequest, res: Response) {
  try {
    const input = updateSchema.parse(req.body);
    const project = await updateProject(req.params.id as string, input);
    res.json(project);
  } catch (err: any) {
    res.status(400).json({ error: err.message ?? "Failed to update project" });
  }
}

export async function remove(req: AuthRequest, res: Response) {
  try {
    await deleteProject(req.params.id as string);
    res.status(204).send();
  } catch (err: any) {
    res.status(400).json({ error: err.message ?? "Failed to delete project" });
  }
}
