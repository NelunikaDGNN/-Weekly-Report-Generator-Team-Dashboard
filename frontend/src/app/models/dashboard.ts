export interface DashboardSummary {
  weekStartDate: string;
  totalReportsSubmitted: number;
  complianceRate: number;
  needsCorrectionCount: number;
  openBlockersCount: number;
  draftCount: number;
  pendingCount: number;
  totalMembers: number;
}

export interface StatusByMember {
  memberId: string;
  memberName: string;
  DRAFT: number;
  SUBMITTED: number;
  NEEDS_CORRECTION: number;
  APPROVED: number;
}

export interface WorkloadByProject {
  projectId: string;
  projectName: string;
  taskCount: number;
  reportCount: number;
}

export interface TimeByTaskType {
  taskType: string;
  totalHours: number;
}

export interface TasksTrend {
  week: string;
  tasksCompleted: number;
}

export interface RecentActivity {
  reportId: string;
  memberName: string;
  projectName: string;
  status: string;
  updatedAt: string;
}