import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth_middleware';

export function requireRole(...roles: ('TEAM_MEMBER' | 'MANAGER')[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}