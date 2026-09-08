import { TaskCompleted, TaskPlanned, Blocker, Achievement, HourBreakdown } from './task';
import { Project } from './project';
import { User } from './user';

export type ReportStatus = 'DRAFT' | 'SUBMITTED' | 'NEEDS_CORRECTION' | 'APPROVED';

export interface WeeklyReport {
  id: string;
  userId: string;
  projectId: string;
  weekStartDate: string;
  weekEndDate: string;
  status: ReportStatus;
  currentReviewComment?: string | null;
  optionalNotes?: string;
  createdAt?: string;
  updatedAt?: string;
  project?: Project;
  user?: Pick<User, 'id' | 'name' | 'email'>;
  tasksCompleted?: TaskCompleted[];
  tasksPlanned?: TaskPlanned[];
  blockers?: Blocker[];
  achievements?: Achievement[];
  hourBreakdown?: HourBreakdown[];
}

export interface CreateReportRequest {
  projectId: string;
  weekStartDate: string;
  weekEndDate: string;
  optionalNotes?: string;
  tasksCompleted?: TaskCompleted[];
  tasksPlanned?: TaskPlanned[];
  blockers?: Blocker[];
  achievements?: Achievement[];
  hourBreakdown?: HourBreakdown[];
}

export interface ReportVersion {
  id: string;
  reportId: string;
  versionNumber: number;
  snapshotData: any;
  managerComment?: string;
  reviewer?: Pick<User, 'id' | 'name'>;
  submittedAt: string;
}

export interface ReviewRequest {
  action: 'APPROVE' | 'REQUEST_CHANGES';
  comment?: string;
}