import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ReportService } from '../../../services/report-service';
import { ProjectService } from '../../../services/project-service';
import { Project } from '../../../models/project';
import { WeeklyReport } from '../../../models/report';

@Component({
  selector: 'app-weekly-report',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatDividerModule,
    MatTooltipModule,
  ],
  templateUrl: './weekly-report.html',
  styleUrl: './weekly-report.css',
})
export class WeeklyReportComponent implements OnInit {
  reportForm: FormGroup;
  projects = signal<Project[]>([]);
  reportId: string | null = null;
  currentReport = signal<WeeklyReport | null>(null);
  loading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  taskTypes = ['DEVELOPMENT', 'TESTING', 'MEETINGS', 'DOCUMENTATION', 'OTHER'];
  priorities = ['HIGH', 'MEDIUM', 'LOW'];

  constructor(
    private fb: FormBuilder,
    private reportService: ReportService,
    private projectService: ProjectService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.reportForm = this.fb.group({
      projectId: ['', Validators.required],
      weekStartDate: ['', Validators.required],
      weekEndDate: ['', Validators.required],
      optionalNotes: [''],
      tasksCompleted: this.fb.array([]),
      tasksPlanned: this.fb.array([]),
      blockers: this.fb.array([]),
      achievements: this.fb.array([]),
      hourBreakdown: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    this.loadProjects();

    this.reportId = this.route.snapshot.paramMap.get('id');
    if (this.reportId) {
      this.loadReport(this.reportId);
    } else {
      this.addTaskCompleted();
      this.addTaskPlanned();
    }
  }

  loadProjects(): void {
    this.projectService.getAll().subscribe({
      next: (projects) => this.projects.set(projects),
      error: () => this.errorMessage.set('Failed to load projects'),
    });
  }

  loadReport(id: string): void {
    this.loading.set(true);
    this.reportService.getReportById(id).subscribe({
      next: (report) => {
        this.currentReport.set(report);
        this.populateForm(report);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load report');
        this.loading.set(false);
      },
    });
  }

  populateForm(report: WeeklyReport): void {
    this.reportForm.patchValue({
      projectId: report.projectId,
      weekStartDate: report.weekStartDate?.split('T')[0],
      weekEndDate: report.weekEndDate?.split('T')[0],
      optionalNotes: report.optionalNotes,
    });

    this.tasksCompleted.clear();
    report.tasksCompleted?.forEach((t) => this.addTaskCompleted(t));

    this.tasksPlanned.clear();
    report.tasksPlanned?.forEach((t) => this.addTaskPlanned(t));

    this.blockers.clear();
    report.blockers?.forEach((b) => this.addBlocker(b));

    this.achievements.clear();
    report.achievements?.forEach((a) => this.addAchievement(a));

    this.hourBreakdown.clear();
    report.hourBreakdown?.forEach((h) => this.addHourBreakdown(h));
  }

  get tasksCompleted(): FormArray {
    return this.reportForm.get('tasksCompleted') as FormArray;
  }
  get tasksPlanned(): FormArray {
    return this.reportForm.get('tasksPlanned') as FormArray;
  }
  get blockers(): FormArray {
    return this.reportForm.get('blockers') as FormArray;
  }
  get achievements(): FormArray {
    return this.reportForm.get('achievements') as FormArray;
  }
  get hourBreakdown(): FormArray {
    return this.reportForm.get('hourBreakdown') as FormArray;
  }

  addTaskCompleted(data?: any): void {
    this.tasksCompleted.push(
      this.fb.group({
        taskName: [data?.taskName ?? '', Validators.required],
        priority: [data?.priority ?? 'MEDIUM', Validators.required],
        plannedPercentage: [data?.plannedPercentage ?? 0, [Validators.required, Validators.min(0), Validators.max(100)]],
        actualPercentage: [data?.actualPercentage ?? 0, [Validators.required, Validators.min(0), Validators.max(100)]],
        status: [data?.status ?? '', Validators.required],
        timePlannedHours: [data?.timePlannedHours ?? 0, [Validators.required, Validators.min(0)]],
        timeSpentHours: [data?.timeSpentHours ?? 0, [Validators.required, Validators.min(0)]],
        outputDeliverable: [data?.outputDeliverable ?? ''],
      })
    );
  }

  addTaskPlanned(data?: any): void {
    this.tasksPlanned.push(
      this.fb.group({
        description: [data?.description ?? '', Validators.required],
        priority: [data?.priority ?? 'MEDIUM', Validators.required],
      })
    );
  }

  addBlocker(data?: any): void {
    this.blockers.push(
      this.fb.group({
        description: [data?.description ?? '', Validators.required],
        isKeyIssue: [data?.isKeyIssue ?? false],
      })
    );
  }

  addAchievement(data?: any): void {
    this.achievements.push(
      this.fb.group({
        description: [data?.description ?? '', Validators.required],
        isKeyAchievement: [data?.isKeyAchievement ?? false],
      })
    );
  }

  addHourBreakdown(data?: any): void {
    this.hourBreakdown.push(
      this.fb.group({
        taskType: [data?.taskType ?? 'DEVELOPMENT', Validators.required],
        hours: [data?.hours ?? 0, [Validators.required, Validators.min(0)]],
      })
    );
  }

  removeAt(array: FormArray, index: number): void {
    array.removeAt(index);
  }

  setKeyIssue(index: number): void {
    this.blockers.controls.forEach((ctrl, i) => {
      ctrl.get('isKeyIssue')?.setValue(i === index);
    });
  }

  setKeyAchievement(index: number): void {
    this.achievements.controls.forEach((ctrl, i) => {
      ctrl.get('isKeyAchievement')?.setValue(i === index);
    });
  }

  isEditable(): boolean {
    const report = this.currentReport();
    return !report || report.status === 'DRAFT' || report.status === 'NEEDS_CORRECTION';
  }

  saveDraft(): void {
    if (this.reportForm.invalid) {
      this.reportForm.markAllAsTouched();
      this.errorMessage.set('Please fill in all required fields correctly.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    const payload = this.reportForm.value;

    const request$ = this.reportId
      ? this.reportService.updateReport(this.reportId, payload)
      : this.reportService.createReport(payload);

    request$.subscribe({
      next: (report) => {
        this.loading.set(false);
        this.successMessage.set('Report saved successfully.');
        this.currentReport.set(report);
        if (!this.reportId) {
          this.reportId = report.id;
          this.router.navigate(['/reports/my-report', report.id]);
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.error ?? 'Failed to save report');
      },
    });
  }

  submitReport(): void {
    if (!this.reportId) {
      this.errorMessage.set('Please save the report as a draft first.');
      return;
    }

    this.loading.set(true);
    this.reportService.submitReport(this.reportId).subscribe({
      next: (report) => {
        this.loading.set(false);
        this.currentReport.set(report);
        this.successMessage.set('Report submitted for review.');
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.error ?? 'Failed to submit report');
      },
    });
  }
}