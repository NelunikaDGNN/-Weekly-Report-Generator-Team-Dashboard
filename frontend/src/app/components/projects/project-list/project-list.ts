import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ProjectService } from '../../../services/project-service';
import { Project } from '../../../models/project';
import { AuthService } from '../../../services/auth-service';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './project-list.html',
  styleUrl: './project-list.css',
})
export class ProjectListComponent implements OnInit {
  projects = signal<Project[]>([]);
  loading = signal(true);
  errorMessage = signal('');
  successMessage = signal('');

  showForm = signal(false);
  editingProject = signal<Project | null>(null);
  projectForm: FormGroup;

  constructor(
    private projectService: ProjectService,
    public authService: AuthService,
    private fb: FormBuilder
  ) {
    this.projectForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
    });
  }

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.loading.set(true);
    this.projectService.getAll().subscribe({
      next: (projects) => {
        this.projects.set(projects);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load projects');
        this.loading.set(false);
      },
    });
  }

  openCreateForm(): void {
    this.editingProject.set(null);
    this.projectForm.reset();
    this.showForm.set(true);
  }

  openEditForm(project: Project): void {
    this.editingProject.set(project);
    this.projectForm.patchValue({
      name: project.name,
      description: project.description,
    });
    this.showForm.set(true);
  }

  cancelForm(): void {
    this.showForm.set(false);
    this.editingProject.set(null);
    this.projectForm.reset();
  }

  saveProject(): void {
    if (this.projectForm.invalid) {
      this.projectForm.markAllAsTouched();
      return;
    }

    const editing = this.editingProject();
    const payload = this.projectForm.value;

    const request$ = editing
      ? this.projectService.update(editing.id, payload)
      : this.projectService.create(payload);

    request$.subscribe({
      next: () => {
        this.successMessage.set(editing ? 'Project updated.' : 'Project created.');
        this.showForm.set(false);
        this.editingProject.set(null);
        this.loadProjects();
      },
      error: (err) => {
        this.errorMessage.set(err.error?.error ?? 'Failed to save project');
      },
    });
  }

  deleteProject(project: Project): void {
    const confirmed = confirm(`Delete project "${project.name}"?`);
    if (!confirmed) return;

    this.projectService.delete(project.id).subscribe({
      next: () => {
        this.successMessage.set(`"${project.name}" deleted.`);
        this.loadProjects();
      },
      error: (err) => {
        this.errorMessage.set(err.error?.error ?? 'Failed to delete project');
      },
    });
  }
}