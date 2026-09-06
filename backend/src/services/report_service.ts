import prisma from '../config/database';
import { CreateReportInput } from '../models/report_model';

export async function createReport(input: CreateReportInput) {
  return prisma.weeklyReport.create({
    data: {
      userId: input.userId,
      projectId: input.projectId,
      weekStartDate: new Date(input.weekStartDate),
      weekEndDate: new Date(input.weekEndDate),
      optionalNotes: input.optionalNotes,
      status: 'DRAFT',
      tasksCompleted: { create: input.tasksCompleted ?? [] },
      tasksPlanned: { create: input.tasksPlanned ?? [] },
      blockers: { create: input.blockers ?? [] },
      achievements: { create: input.achievements ?? [] },
      hourBreakdown: { create: input.hourBreakdown ?? [] },
    },
    include: {
      tasksCompleted: true,
      tasksPlanned: true,
      blockers: true,
      achievements: true,
      hourBreakdown: true,
    },
  });
}

export async function getReportById(id: string) {
  return prisma.weeklyReport.findUnique({
    where: { id },
    include: {
      tasksCompleted: true,
      tasksPlanned: true,
      blockers: true,
      achievements: true,
      hourBreakdown: true,
      versions: true,
      project: true,
      user: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function getUserReports(userId: string) {
  return prisma.weeklyReport.findMany({
    where: { userId },
    orderBy: { weekStartDate: 'desc' },
    include: { project: true },
  });
}

export async function submitReport(id: string, userId: string) {
  const report = await prisma.weeklyReport.findUnique({ where: { id } });
  if (!report) throw new Error('Report not found');
  if (report.userId !== userId) throw new Error('Not authorized to submit this report');
  if (report.status !== 'DRAFT' && report.status !== 'NEEDS_CORRECTION') {
    throw new Error('Only draft or needs-correction reports can be submitted');
  }

  return prisma.weeklyReport.update({
    where: { id },
    data: { status: 'SUBMITTED' },
  });
}

export async function updateReport(id: string, userId: string, input: CreateReportInput) {
  const report = await prisma.weeklyReport.findUnique({ where: { id } });
  if (!report) throw new Error('Report not found');
  if (report.userId !== userId) throw new Error('Not authorized to edit this report');
  if (report.status !== 'DRAFT' && report.status !== 'NEEDS_CORRECTION') {
    throw new Error('Only draft or needs-correction reports can be edited');
  }

  // Replace-all: delete existing child records, then recreate
  await prisma.taskCompleted.deleteMany({ where: { reportId: id } });
  await prisma.taskPlanned.deleteMany({ where: { reportId: id } });
  await prisma.blocker.deleteMany({ where: { reportId: id } });
  await prisma.achievement.deleteMany({ where: { reportId: id } });
  await prisma.hourBreakdown.deleteMany({ where: { reportId: id } });

  return prisma.weeklyReport.update({
    where: { id },
    data: {
      projectId: input.projectId,
      weekStartDate: new Date(input.weekStartDate),
      weekEndDate: new Date(input.weekEndDate),
      optionalNotes: input.optionalNotes,
      tasksCompleted: { create: input.tasksCompleted ?? [] },
      tasksPlanned: { create: input.tasksPlanned ?? [] },
      blockers: { create: input.blockers ?? [] },
      achievements: { create: input.achievements ?? [] },
      hourBreakdown: { create: input.hourBreakdown ?? [] },
    },
    include: {
      tasksCompleted: true,
      tasksPlanned: true,
      blockers: true,
      achievements: true,
      hourBreakdown: true,
    },
  });

}


export async function reviewReport(
  id: string,
  reviewerId: string,
  action: 'APPROVE' | 'REQUEST_CHANGES',
  comment?: string
) {
  const report = await prisma.weeklyReport.findUnique({
    where: { id },
    include: {
      tasksCompleted: true,
      tasksPlanned: true,
      blockers: true,
      achievements: true,
      hourBreakdown: true,
    },
  });

  if (!report) throw new Error('Report not found');
  if (report.status !== 'SUBMITTED') {
    throw new Error('Only submitted reports can be reviewed');
  }

  if (action === 'APPROVE') {
    return prisma.weeklyReport.update({
      where: { id },
      data: { status: 'APPROVED', currentReviewComment: null },
    });
  }

  // REQUEST_CHANGES: snapshot current content, then flip status
  if (!comment) throw new Error('A comment is required when requesting changes');

  const versionCount = await prisma.reportVersion.count({ where: { reportId: id } });

  await prisma.reportVersion.create({
    data: {
      reportId: id,
      versionNumber: versionCount + 1,
      snapshotData: {
        weekStartDate: report.weekStartDate,
        weekEndDate: report.weekEndDate,
        optionalNotes: report.optionalNotes,
        tasksCompleted: report.tasksCompleted,
        tasksPlanned: report.tasksPlanned,
        blockers: report.blockers,
        achievements: report.achievements,
        hourBreakdown: report.hourBreakdown,
      },
      managerComment: comment,
      reviewerId: reviewerId,
    },
  });

  return prisma.weeklyReport.update({
    where: { id },
    data: { status: 'NEEDS_CORRECTION', currentReviewComment: comment },
  });
}

export async function getReportVersions(reportId: string) {
  return prisma.reportVersion.findMany({
    where: { reportId },
    orderBy: { versionNumber: 'asc' },
    include: { reviewer: { select: { id: true, name: true } } },
  });
}

export async function getTeamReports(filters: {
  memberId?: string;
  projectId?: string;
  status?: string;
  weekStartDate?: string;
}) {
  return prisma.weeklyReport.findMany({
    where: {
      userId: filters.memberId,
      projectId: filters.projectId,
      status: filters.status as any,
      weekStartDate: filters.weekStartDate ? new Date(filters.weekStartDate) : undefined,
    },
    orderBy: { weekStartDate: 'desc' },
    include: {
      user: { select: { id: true, name: true, email: true } },
      project: true,
    },
  });
}

export async function getDashboardSummary(weekStartDate?: string) {
  // Default to the start of the current week (Sunday) if not specified
  let targetWeek: Date;
  if (weekStartDate) {
    targetWeek = new Date(weekStartDate);
  } else {
    targetWeek = new Date();
    targetWeek.setDate(targetWeek.getDate() - targetWeek.getDay());
    targetWeek.setHours(0, 0, 0, 0);
  }

  const totalMembers = await prisma.user.count({ where: { role: 'TEAM_MEMBER' } });

  const reports = await prisma.weeklyReport.findMany({
    where: { weekStartDate: targetWeek },
    include: { blockers: true },
  });

  const submittedStatuses = ['SUBMITTED', 'NEEDS_CORRECTION', 'APPROVED'];
  const submittedMemberIds = new Set(
    reports.filter((r) => submittedStatuses.includes(r.status)).map((r) => r.userId)
  );

  const needsCorrectionCount = reports.filter((r) => r.status === 'NEEDS_CORRECTION').length;
  const draftCount = reports.filter((r) => r.status === 'DRAFT').length;
  const openBlockersCount = reports.reduce((sum, r) => sum + r.blockers.length, 0);

  const submittedCount = submittedMemberIds.size;
  const pendingCount = Math.max(totalMembers - reports.length, 0);
  const complianceRate = totalMembers > 0 ? Math.round((submittedCount / totalMembers) * 100) : 0;

  return {
    weekStartDate: targetWeek,
    totalReportsSubmitted: submittedCount,
    complianceRate,
    needsCorrectionCount,
    openBlockersCount,
    draftCount,
    pendingCount,
    totalMembers,
  };
}


export async function getStatusByMember() {
  const members = await prisma.user.findMany({
    where: { role: 'TEAM_MEMBER' },
    include: {
      reports: {
        select: { status: true },
      },
    },
  });

  return members.map((m) => {
    const counts = { DRAFT: 0, SUBMITTED: 0, NEEDS_CORRECTION: 0, APPROVED: 0 };
    m.reports.forEach((r) => { counts[r.status]++; });
    return { memberId: m.id, memberName: m.name, ...counts };
  });
}

export async function getWorkloadByProject() {
  const projects = await prisma.project.findMany({
    include: {
      reports: {
        include: { tasksCompleted: true },
      },
    },
  });

  return projects.map((p) => ({
    projectId: p.id,
    projectName: p.name,
    taskCount: p.reports.reduce((sum, r) => sum + r.tasksCompleted.length, 0),
    reportCount: p.reports.length,
  }));
}

export async function getTimeByTaskType() {
  const breakdowns = await prisma.hourBreakdown.groupBy({
    by: ['taskType'],
    _sum: { hours: true },
  });

  return breakdowns.map((b) => ({
    taskType: b.taskType,
    totalHours: b._sum.hours ?? 0,
  }));
}

export async function getTasksCompletedTrend() {
  const reports = await prisma.weeklyReport.findMany({
    select: {
      weekStartDate: true,
      tasksCompleted: { select: { id: true } },
    },
    orderBy: { weekStartDate: 'asc' },
  });

  const trendMap = new Map<string, number>();
  reports.forEach((r) => {
    const key = r.weekStartDate.toISOString().split('T')[0];
    trendMap.set(key, (trendMap.get(key) ?? 0) + r.tasksCompleted.length);
  });

  return Array.from(trendMap.entries()).map(([week, count]) => ({ week, tasksCompleted: count }));
}

export async function getRecentActivity() {
  const recentReports = await prisma.weeklyReport.findMany({
    orderBy: { updatedAt: 'desc' },
    take: 10,
    include: { user: { select: { name: true } }, project: { select: { name: true } } },
  });

  return recentReports.map((r) => ({
    reportId: r.id,
    memberName: r.user.name,
    projectName: r.project.name,
    status: r.status,
    updatedAt: r.updatedAt,
  }));
}



