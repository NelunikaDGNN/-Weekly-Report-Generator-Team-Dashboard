import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  DashboardSummary,
  StatusByMember,
  WorkloadByProject,
  TimeByTaskType,
  TasksTrend,
  RecentActivity,
} from '../models/dashboard';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/reports/dashboard`;

  constructor(private http: HttpClient) {}

  getSummary(weekStartDate?: string): Observable<DashboardSummary> {
    const query = weekStartDate ? `?weekStartDate=${weekStartDate}` : '';
    return this.http.get<DashboardSummary>(`${this.apiUrl}/summary${query}`);
  }

  getStatusByMember(): Observable<StatusByMember[]> {
    return this.http.get<StatusByMember[]>(`${this.apiUrl}/status-by-member`);
  }

  getWorkloadByProject(): Observable<WorkloadByProject[]> {
    return this.http.get<WorkloadByProject[]>(`${this.apiUrl}/workload-by-project`);
  }

  getTimeByTaskType(): Observable<TimeByTaskType[]> {
    return this.http.get<TimeByTaskType[]>(`${this.apiUrl}/time-by-task-type`);
  }

  getTasksTrend(): Observable<TasksTrend[]> {
    return this.http.get<TasksTrend[]>(`${this.apiUrl}/tasks-trend`);
  }

  getRecentActivity(): Observable<RecentActivity[]> {
    return this.http.get<RecentActivity[]>(`${this.apiUrl}/recent-activity`);
  }
}