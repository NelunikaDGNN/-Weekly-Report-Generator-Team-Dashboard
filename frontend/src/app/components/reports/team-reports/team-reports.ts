import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ReportService } from '../../../services/report-service';
import { ProjectService } from '../../../services/project-service';
import { UserService } from '../../../services/user-service';
import { WeeklyReport } from '../../../models/report';

@Component({
  selector: 'app-team-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './team-reports.html',
  styleUrl: './team-reports.css',
})
export class TeamReportsComponent implements OnInit {
  reports = signal<WeeklyReport[]>([]);
  members = signal<{ id: string; name: string }[]>([]);
  projects = signal<{ id: string; name: string }[]>([]);
  loading = signal(true);
  errorMessage = signal('');

  memberId = signal<string>('');
  projectId = signal<string>('');
  status = signal<string>('');
  weekStartDate = signal<string>('');

  statusOptions = ['SUBMITTED', 'NEEDS_CORRECTION', 'APPROVED', 'DRAFT'];

  constructor(
    private reportService: ReportService,
    private projectService: ProjectService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadFilters();
    this.loadReports();
  }

  loadFilters(): void {
    this.userService.getAll('TEAM_MEMBER').subscribe({
  next: (members) => this.members.set(members),
  error: () => {},
});

   this.projectService.getAll().subscribe({
  next: (projects) => this.projects.set(projects),
  error: () => {},
});
  }

  loadReports(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.reportService
      .getTeamReports({
        memberId: this.memberId() || undefined,
        projectId: this.projectId() || undefined,
        status: this.status() || undefined,
        weekStartDate: this.weekStartDate() || undefined,
      })
      .subscribe({
        next: (reports) => {
          this.reports.set(reports);
          this.loading.set(false);
        },
        error: (err) => {
          this.errorMessage.set(err.error?.error ?? 'Failed to load team reports');
          this.loading.set(false);
        },
      });
  }

  onFilterChange(): void {
    this.loadReports();
  }

  clearFilters(): void {
    this.memberId.set('');
    this.projectId.set('');
    this.status.set('');
    this.weekStartDate.set('');
    this.loadReports();
  }

  openReport(id: string): void {
    this.router.navigate(['/reports/detail', id]);
  }
}