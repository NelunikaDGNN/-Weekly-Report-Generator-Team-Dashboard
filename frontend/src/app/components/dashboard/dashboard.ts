import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { DashboardService } from '../../services/dashboard-service';
import { AuthService } from '../../services/auth-service';
import {
  DashboardSummary,
  StatusByMember,
  WorkloadByProject,
  TimeByTaskType,
  TasksTrend,
  RecentActivity,
} from '../../models/dashboard';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    BaseChartDirective,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent implements OnInit {
  loading = signal(true);
  errorMessage = signal('');
  selectedWeek = signal<Date | null>(null);

  summary = signal<DashboardSummary | null>(null);
  recentActivity = signal<RecentActivity[]>([]);

  trendChartData = signal<ChartData<'line'>>({ labels: [], datasets: [{ data: [], label: 'Tasks Completed', tension: 0.3 }] });
  trendChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    plugins: { legend: { display: false } },
  };

  statusChartData = signal<ChartData<'bar'>>({ labels: [], datasets: [] });
  statusChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    scales: { x: { stacked: true }, y: { stacked: true } },
  };

  workloadChartData = signal<ChartData<'bar'>>({ labels: [], datasets: [{ data: [], label: 'Tasks' }] });
  workloadChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    plugins: { legend: { display: false } },
  };

  timeChartData = signal<ChartData<'doughnut'>>({ labels: [], datasets: [{ data: [] }] });
  timeChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
  };

  constructor(
    private dashboardService: DashboardService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    if (this.authService.isManager()) {
      this.loadAllData();
    } else {
      this.loading.set(false);
    }
  }

  loadAllData(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.loadSummary();

    this.dashboardService.getStatusByMember().subscribe({
      next: (data) => this.buildStatusChart(data),
      error: () => {},
    });

    this.dashboardService.getWorkloadByProject().subscribe({
      next: (data) => this.buildWorkloadChart(data),
      error: () => {},
    });

    this.dashboardService.getTimeByTaskType().subscribe({
      next: (data) => this.buildTimeChart(data),
      error: () => {},
    });

    this.dashboardService.getTasksTrend().subscribe({
      next: (data) => this.buildTrendChart(data),
      error: () => {},
    });

    this.dashboardService.getRecentActivity().subscribe({
      next: (data) => {
        this.recentActivity.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load recent activity');
        this.loading.set(false);
      },
    });
  }

  onWeekChange(): void {
    this.loadSummary();
  }

  private loadSummary(): void {
    const dateStr = this.selectedWeek() ? this.formatDate(this.selectedWeek()!) : undefined;
    this.dashboardService.getSummary(dateStr).subscribe({
      next: (data) => this.summary.set(data),
      error: () => this.errorMessage.set('Failed to load summary'),
    });
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private buildTrendChart(data: TasksTrend[]): void {
    this.trendChartData.set({
      labels: data.map((d) => d.week),
      datasets: [{ data: data.map((d) => d.tasksCompleted), label: 'Tasks Completed', tension: 0.3 }],
    });
  }

  private buildStatusChart(data: StatusByMember[]): void {
    this.statusChartData.set({
      labels: data.map((d) => d.memberName),
      datasets: [
        { data: data.map((d) => d.DRAFT), label: 'Draft', backgroundColor: '#94a3b8' },
        { data: data.map((d) => d.SUBMITTED), label: 'Submitted', backgroundColor: '#3b82f6' },
        { data: data.map((d) => d.NEEDS_CORRECTION), label: 'Needs Correction', backgroundColor: '#f59e0b' },
        { data: data.map((d) => d.APPROVED), label: 'Approved', backgroundColor: '#22c55e' },
      ],
    });
  }

  private buildWorkloadChart(data: WorkloadByProject[]): void {
    this.workloadChartData.set({
      labels: data.map((d) => d.projectName),
      datasets: [{ data: data.map((d) => d.taskCount), label: 'Tasks', backgroundColor: '#3b82f6' }],
    });
  }

  private buildTimeChart(data: TimeByTaskType[]): void {
    this.timeChartData.set({
      labels: data.map((d) => d.taskType),
      datasets: [
        {
          data: data.map((d) => d.totalHours),
          backgroundColor: ['#3b82f6', '#f59e0b', '#22c55e', '#a855f7', '#ef4444'],
        },
      ],
    });
  }
}