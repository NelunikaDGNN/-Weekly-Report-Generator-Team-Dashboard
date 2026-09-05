import { Router, Response } from 'express';
import { register, login } from '../controllers/auth_controller';
import { authenticate, AuthRequest } from '../middleware/auth_middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);

router.get('/me', authenticate, (req: AuthRequest, res: Response) => {
  res.json({ user: req.user });
});

export default router;