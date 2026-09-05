import prisma from '../config/database';
import { CreateProjectInput, UpdateProjectInput } from '../models/project_model';

export async function createProject(input: CreateProjectInput) {
  return prisma.project.create({ data: input });
}

export async function getAllProjects() {
  return prisma.project.findMany({ orderBy: { name: 'asc' } });
}

export async function updateProject(id: string, input: UpdateProjectInput) {
  return prisma.project.update({
    where: { id },
    data: input,
  });
}

export async function deleteProject(id: string) {
  return prisma.project.delete({ where: { id } });
}