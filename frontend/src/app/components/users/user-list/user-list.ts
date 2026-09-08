import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip'
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/user-service';
import { User, Role } from '../../../models/user';
import { AuthService } from '../../../services/auth-service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatTooltipModule,
  ],
  templateUrl: './user-list.html',
  styleUrl: './user-list.css',
})
export class UserListComponent implements OnInit {
  users = signal<User[]>([]);
  loading = signal(true);
  errorMessage = signal('');
  successMessage = signal('');
  roleFilter = signal<'' | Role>('');

  displayedColumns = ['name', 'email', 'role', 'joined', 'actions'];

  constructor(
    private userService: UserService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    const filter = this.roleFilter();
    this.userService.getAll(filter || undefined).subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load users');
        this.loading.set(false);
      },
    });
  }

  onFilterChange(value: '' | Role): void {
    this.roleFilter.set(value);
    this.loadUsers();
  }

  isSelf(user: User): boolean {
    return user.id === this.authService.currentUser()?.id;
  }

  toggleRole(user: User): void {
    const newRole: Role = user.role === 'MANAGER' ? 'TEAM_MEMBER' : 'MANAGER';
    const confirmed = confirm(
      `Change ${user.name}'s role to ${newRole.replace('_', ' ')}?`
    );
    if (!confirmed) return;

    this.userService.updateRole(user.id, newRole).subscribe({
      next: () => {
        this.successMessage.set(`${user.name} is now a ${newRole.replace('_', ' ')}.`);
        this.loadUsers();
      },
      error: (err) => {
        this.errorMessage.set(err.error?.error ?? 'Failed to update role');
      },
    });
  }

  deleteUser(user: User): void {
    const confirmed = confirm(`Delete ${user.name}? This cannot be undone.`);
    if (!confirmed) return;

    this.userService.delete(user.id).subscribe({
      next: () => {
        this.successMessage.set(`${user.name} was deleted.`);
        this.loadUsers();
      },
      error: (err) => {
        this.errorMessage.set(err.error?.error ?? 'Failed to delete user');
      },
    });
  }
}