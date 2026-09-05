import { Router } from 'express';
import { authenticate } from '../middleware/auth_middleware';
import { requireRole } from '../middleware/role_middleware';
import { create, update, getOne, listMine, submit, review, versions, teamReports } from '../controllers/report_controller';

const router = Router();

router.post('/', authenticate, create);
router.put('/:id', authenticate, update);
router.get('/mine', authenticate, listMine);
router.get('/team', authenticate, requireRole('MANAGER'), teamReports);
router.get('/:id', authenticate, getOne);
router.get('/:id/versions', authenticate, versions);
router.post('/:id/submit', authenticate, submit);
router.post('/:id/review', authenticate, requireRole('MANAGER'), review);

export default router;