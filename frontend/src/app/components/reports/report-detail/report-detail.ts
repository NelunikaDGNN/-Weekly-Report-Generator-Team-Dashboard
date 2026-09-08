import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { ReportService } from '../../../services/report-service';
import { AuthService } from '../../../services/auth-service';
import { WeeklyReport, ReportVersion } from '../../../models/report';

@Component({
  selector: 'app-report-detail',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatChipsModule, MatButtonModule, MatIconModule, MatDividerModule],
  templateUrl: './report-detail.html',
  styleUrl: './report-detail.css',
})
export class ReportDetailComponent implements OnInit {
  report = signal<WeeklyReport | null>(null);
  versions = signal<ReportVersion[]>([]);
  loading = signal(true);
  errorMessage = signal('');
  showVersions = signal(false);

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private reportService: ReportService,
    public authService: AuthService,
    private location: Location

  ) {}
  goBack(): void {
  this.location.back();
}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadReport(id);
      this.loadVersions(id);
    }
  }

  loadReport(id: string): void {
  this.loading.set(true);
  this.reportService.getReportById(id).subscribe({
    next: (report) => {
      this.report.set(report);
      this.loading.set(false);
    },
    error: (err) => {
      this.errorMessage.set(err.error?.error ?? 'Failed to load report');
      this.loading.set(false);
    },
  });
}

  loadVersions(id: string): void {
    this.reportService.getVersions(id).subscribe({
      next: (versions) => this.versions.set(versions),
      error: () => {},
    });
  }

  toggleVersions(): void {
    this.showVersions.update((v) => !v);
  }

  isOwner(): boolean {
    return this.report()?.userId === this.authService.currentUser()?.id;
  }

  goToReview(): void {
    this.router.navigate(['/reports/review', this.report()?.id]);
  }
}