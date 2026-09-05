export interface TaskCompletedInput {
  taskName: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  plannedPercentage: number;
  actualPercentage: number;
  status: string;
  timePlannedHours: number;
  timeSpentHours: number;
  outputDeliverable?: string;
}

export interface TaskPlannedInput {
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface BlockerInput {
  description: string;
  isKeyIssue?: boolean;
}

export interface AchievementInput {
  description: string;
  isKeyAchievement?: boolean;
}

export interface HourBreakdownInput {
  taskType: 'DEVELOPMENT' | 'TESTING' | 'MEETINGS' | 'DOCUMENTATION' | 'OTHER';
  hours: number;
}

export interface CreateReportInput {
  userId: string;
  projectId: string;
  weekStartDate: string;
  weekEndDate: string;
  optionalNotes?: string;
  tasksCompleted?: TaskCompletedInput[];
  tasksPlanned?: TaskPlannedInput[];
  blockers?: BlockerInput[];
  achievements?: AchievementInput[];
  hourBreakdown?: HourBreakdownInput[];
}