import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReportService } from '../../../services/report-service';
import { WeeklyReport } from '../../../models/report';

@Component({
  selector: 'app-manager-review',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatChipsModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './manager-review.html',
  styleUrl: './manager-review.css',
})
export class ManagerReviewComponent implements OnInit {
  report = signal<WeeklyReport | null>(null);
  loading = signal(true);
  submitting = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  showCommentBox = signal(false);

  commentForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private reportService: ReportService,
    private fb: FormBuilder
  ) {
    this.commentForm = this.fb.group({
      comment: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadReport(id);
    }
  }

  loadReport(id: string): void {
    this.loading.set(true);
    this.reportService.getReportById(id).subscribe({
      next: (report) => {
        this.report.set(report);
        this.loading.set(false);

        if (report.status !== 'SUBMITTED') {
          this.errorMessage.set('This report is not currently awaiting review.');
        }
      },
      error: (err) => {
        this.errorMessage.set(err.error?.error ?? 'Failed to load report');
        this.loading.set(false);
      },
    });
  }

  openCommentBox(): void {
    this.showCommentBox.set(true);
  }

  cancelComment(): void {
    this.showCommentBox.set(false);
    this.commentForm.reset();
  }

  approve(): void {
    const id = this.report()?.id;
    if (!id) return;

    this.submitting.set(true);
    this.errorMessage.set('');

    this.reportService.reviewReport(id, { action: 'APPROVE' }).subscribe({
      next: (report) => {
        this.submitting.set(false);
        this.report.set(report);
        this.successMessage.set('Report approved successfully.');
      },
      error: (err) => {
        this.submitting.set(false);
        this.errorMessage.set(err.error?.error ?? 'Failed to approve report');
      },
    });
  }

  requestChanges(): void {
    if (this.commentForm.invalid) {
      this.commentForm.markAllAsTouched();
      return;
    }

    const id = this.report()?.id;
    if (!id) return;

    this.submitting.set(true);
    this.errorMessage.set('');

    this.reportService
      .reviewReport(id, {
        action: 'REQUEST_CHANGES',
        comment: this.commentForm.value.comment,
      })
      .subscribe({
        next: (report) => {
          this.submitting.set(false);
          this.report.set(report);
          this.successMessage.set('Changes requested. The team member has been notified.');
          this.showCommentBox.set(false);
        },
        error: (err) => {
          this.submitting.set(false);
          this.errorMessage.set(err.error?.error ?? 'Failed to request changes');
        },
      });
  }
}