export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';
export type TaskType = 'DEVELOPMENT' | 'TESTING' | 'MEETINGS' | 'DOCUMENTATION' | 'OTHER';

export interface TaskCompleted {
  id?: string;
  taskName: string;
  priority: Priority;
  plannedPercentage: number;
  actualPercentage: number;
  status: string;
  timePlannedHours: number;
  timeSpentHours: number;
  outputDeliverable?: string;
}

export interface TaskPlanned {
  id?: string;
  description: string;
  priority: Priority;
}

export interface Blocker {
  id?: string;
  description: string;
  isKeyIssue?: boolean;
}

export interface Achievement {
  id?: string;
  description: string;
  isKeyAchievement?: boolean;
}

export interface HourBreakdown {
  id?: string;
  taskType: TaskType;
  hours: number;
}