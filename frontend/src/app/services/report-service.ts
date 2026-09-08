import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { WeeklyReport, CreateReportRequest, ReportVersion, ReviewRequest } from '../models/report';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private apiUrl = `${environment.apiUrl}/reports`;

  constructor(private http: HttpClient) {}

  createReport(data: CreateReportRequest): Observable<WeeklyReport> {
    return this.http.post<WeeklyReport>(this.apiUrl, data);
  }

  updateReport(id: string, data: CreateReportRequest): Observable<WeeklyReport> {
    return this.http.put<WeeklyReport>(`${this.apiUrl}/${id}`, data);
  }

  getMyReports(): Observable<WeeklyReport[]> {
    return this.http.get<WeeklyReport[]>(`${this.apiUrl}/mine`);
  }

  getReportById(id: string): Observable<WeeklyReport> {
    return this.http.get<WeeklyReport>(`${this.apiUrl}/${id}`);
  }

  submitReport(id: string): Observable<WeeklyReport> {
    return this.http.post<WeeklyReport>(`${this.apiUrl}/${id}/submit`, {});
  }

  reviewReport(id: string, data: ReviewRequest): Observable<WeeklyReport> {
    return this.http.post<WeeklyReport>(`${this.apiUrl}/${id}/review`, data);
  }

  getVersions(id: string): Observable<ReportVersion[]> {
    return this.http.get<ReportVersion[]>(`${this.apiUrl}/${id}/versions`);
  }

  getTeamReports(filters?: { memberId?: string; projectId?: string; status?: string; weekStartDate?: string }): Observable<WeeklyReport[]> {
    let params = '';
    if (filters) {
      const query = Object.entries(filters)
        .filter(([_, v]) => v)
        .map(([k, v]) => `${k}=${v}`)
        .join('&');
      if (query) params = `?${query}`;
    }
    return this.http.get<WeeklyReport[]>(`${this.apiUrl}/team${params}`);
  }
}