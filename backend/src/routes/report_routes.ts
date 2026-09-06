import { Router } from 'express';
import { authenticate } from '../middleware/auth_middleware';
import { requireRole } from '../middleware/role_middleware';
import { create, update, getOne, listMine, submit, review, versions, teamReports, dashboardSummary, statusByMember, workloadByProject, timeByTaskType, recentActivity, tasksCompletedTrend } from '../controllers/report_controller';

const router = Router();

router.post('/', authenticate, create);
router.put('/:id', authenticate, update);
router.get('/mine', authenticate, listMine);
router.get('/team', authenticate, requireRole('MANAGER'), teamReports);
router.get('/:id', authenticate, getOne);
router.get('/:id/versions', authenticate, versions);
router.post('/:id/submit', authenticate, submit);
router.post('/:id/review', authenticate, requireRole('MANAGER'), review);
router.get('/dashboard/summary', authenticate, requireRole('MANAGER'), dashboardSummary);
router.get('/dashboard/status-by-member', authenticate, requireRole('MANAGER'), statusByMember);
router.get('/dashboard/workload-by-project', authenticate, requireRole('MANAGER'), workloadByProject);
router.get('/dashboard/time-by-task-type', authenticate, requireRole('MANAGER'), timeByTaskType);
router.get('/dashboard/tasks-trend', authenticate, requireRole('MANAGER'), tasksCompletedTrend);
router.get('/dashboard/recent-activity', authenticate, requireRole('MANAGER'), recentActivity);

export default router;