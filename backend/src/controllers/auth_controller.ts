import { Request, Response } from 'express';
import { z } from 'zod';
import { registerUser, loginUser } from '../services/auth_service';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  role: z.enum(['TEAM_MEMBER', 'MANAGER']).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function register(req: Request, res: Response) {
  try {
    const input = registerSchema.parse(req.body);
    const result = await registerUser(input);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message ?? 'Registration failed' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const input = loginSchema.parse(req.body);
    const result = await loginUser(input);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(401).json({ error: err.message ?? 'Login failed' });
  }
}