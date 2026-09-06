import { Router } from 'express';
import { authenticate } from '../middleware/auth_middleware';
import { requireRole } from '../middleware/role_middleware';
import { list, updateRole, remove, stats } from '../controllers/user_controller';

const router = Router();

router.get('/', authenticate, requireRole('MANAGER'), list);
router.get('/:id/stats', authenticate, requireRole('MANAGER'), stats);
router.put('/:id/role', authenticate, requireRole('MANAGER'), updateRole);
router.delete('/:id', authenticate, requireRole('MANAGER'), remove);

export default router;