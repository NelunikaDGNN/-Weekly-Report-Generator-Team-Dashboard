import { Router } from 'express';
import { authenticate } from '../middleware/auth_middleware';
import { requireRole } from '../middleware/role_middleware';
import { create, list, update, remove } from '../controllers/project_controller';

const router = Router();

router.get('/', authenticate, list);
router.post('/', authenticate, requireRole('MANAGER'), create);
router.put('/:id', authenticate, requireRole('MANAGER'), update);
router.delete('/:id', authenticate, requireRole('MANAGER'), remove);

export default router;