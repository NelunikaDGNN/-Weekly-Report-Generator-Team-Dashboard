import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth_middleware';
import { getAllUsers, updateUserRole, deleteUser, getUserStats } from '../services/user_service';

const roleSchema = z.object({
  role: z.enum(['TEAM_MEMBER', 'MANAGER']),
});

export async function list(req: AuthRequest, res: Response) {
  try {
    const { role } = req.query;
    const users = await getAllUsers(role as 'TEAM_MEMBER' | 'MANAGER' | undefined);
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
}

export async function updateRole(req: AuthRequest, res: Response) {
  try {
    const input = roleSchema.parse(req.body);
    const user = await updateUserRole(req.params.id as string, input.role);
    res.json(user);
  } catch (err: any) {
    res.status(400).json({ error: err.message ?? 'Failed to update role' });
  }
}

export async function remove(req: AuthRequest, res: Response) {
  try {
    await deleteUser(req.params.id as string);
    res.status(204).send();
  } catch (err: any) {
    res.status(400).json({ error: err.message ?? 'Failed to delete user' });
  }
}

export async function stats(req: AuthRequest, res: Response) {
  try {
    const data = await getUserStats(req.params.id as string);
    res.json(data);
  } catch (err: any) {
    res.status(404).json({ error: err.message ?? 'User not found' });
  }
}