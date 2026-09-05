import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth_middleware';
import {
  createReport,
  updateReport,
  getReportById,
  getUserReports,
  submitReport,
  reviewReport,
  getReportVersions, 
  getTeamReports

} from '../services/report_service';


const taskCompletedSchema = z.object({
  taskName: z.string(),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']),
  plannedPercentage: z.number(),
  actualPercentage: z.number(),
  status: z.string(),
  timePlannedHours: z.number(),
  timeSpentHours: z.number(),
  outputDeliverable: z.string().optional(),
});

const taskPlannedSchema = z.object({
  description: z.string(),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']),
});

const blockerSchema = z.object({
  description: z.string(),
  isKeyIssue: z.boolean().optional(),
});

const achievementSchema = z.object({
  description: z.string(),
  isKeyAchievement: z.boolean().optional(),
});

const hourBreakdownSchema = z.object({
  taskType: z.enum(['DEVELOPMENT', 'TESTING', 'MEETINGS', 'DOCUMENTATION', 'OTHER']),
  hours: z.number(),
});

const reportSchema = z.object({
  projectId: z.string(),
  weekStartDate: z.string(),
  weekEndDate: z.string(),
  optionalNotes: z.string().optional(),
  tasksCompleted: z.array(taskCompletedSchema).optional(),
  tasksPlanned: z.array(taskPlannedSchema).optional(),
  blockers: z.array(blockerSchema).optional(),
  achievements: z.array(achievementSchema).optional(),
  hourBreakdown: z.array(hourBreakdownSchema).optional(),
});

export async function create(req: AuthRequest, res: Response) {
  try {
    const input = reportSchema.parse(req.body);
    const report = await createReport({ ...input, userId: req.user!.userId });
    res.status(201).json(report);
  } catch (err: any) {
    res.status(400).json({ error: err.message ?? 'Failed to create report' });
  }
}

export async function update(req: AuthRequest, res: Response) {
  try {
    const input = reportSchema.parse(req.body);
    const report = await updateReport(req.params.id as string, req.user!.userId, {
      ...input,
      userId: req.user!.userId,
    });
    res.json(report);
  } catch (err: any) {
    res.status(400).json({ error: err.message ?? 'Failed to update report' });
  }
}

export async function getOne(req: AuthRequest, res: Response) {
  try {
    const report = await getReportById(req.params.id as string);
    if (!report) return res.status(404).json({ error: 'Report not found' });

    // Team members can only view their own reports
    if (req.user!.role === 'TEAM_MEMBER' && report.userId !== req.user!.userId) {
      return res.status(403).json({ error: 'Not authorized to view this report' });
    }

    res.json(report);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch report' });
  }
}

export async function listMine(req: AuthRequest, res: Response) {
  try {
    const reports = await getUserReports(req.user!.userId);
    res.json(reports);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
}

export async function submit(req: AuthRequest, res: Response) {
  try {
    const report = await submitReport(req.params.id as string, req.user!.userId);
    res.json(report);
  } catch (err: any) {
    res.status(400).json({ error: err.message ?? 'Failed to submit report' });
  }
}

const reviewSchema = z.object({
  action: z.enum(['APPROVE', 'REQUEST_CHANGES']),
  comment: z.string().optional(),
});

export async function review(req: AuthRequest, res: Response) {
  try {
    const input = reviewSchema.parse(req.body);
    const report = await reviewReport(
      req.params.id as string,
      req.user!.userId,
      input.action,
      input.comment
    );
    res.json(report);
  } catch (err: any) {
    res.status(400).json({ error: err.message ?? 'Failed to review report' });
  }
}

export async function versions(req: AuthRequest, res: Response) {
  try {
    const versions = await getReportVersions(req.params.id as string);
    res.json(versions);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch versions' });
  }
}

export async function teamReports(req: AuthRequest, res: Response) {
  try {
    const { memberId, projectId, status, weekStartDate } = req.query;
    const reports = await getTeamReports({
      memberId: memberId as string,
      projectId: projectId as string,
      status: status as string,
      weekStartDate: weekStartDate as string,
    });
    res.json(reports);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch team reports' });
  }
}