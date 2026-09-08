import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { ReportService } from '../../../services/report-service';
import { WeeklyReport } from '../../../models/report';

@Component({
  selector: 'app-report-history',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatChipsModule],
  templateUrl: './report-history.html',
  styleUrl: './report-history.css',
})
export class ReportHistoryComponent implements OnInit {
  reports = signal<WeeklyReport[]>([]);
  loading = signal(true);
  errorMessage = signal('');

  displayedColumns = ['week', 'project', 'status', 'actions'];

  constructor(
    private reportService: ReportService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    this.loading.set(true);
    this.reportService.getMyReports().subscribe({
      next: (reports) => {
        this.reports.set(reports);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load report history');
        this.loading.set(false);
      },
    });
  }

 viewReport(id: string): void {
  this.router.navigate(['/reports/detail', id]);
}

  formatWeek(report: WeeklyReport): string {
    const start = new Date(report.weekStartDate).toLocaleDateString();
    const end = new Date(report.weekEndDate).toLocaleDateString();
    return `${start} - ${end}`;
  }
}