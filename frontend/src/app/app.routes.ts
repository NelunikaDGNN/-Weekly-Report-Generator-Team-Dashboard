import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login';
import { RegisterComponent } from './components/auth/register/register';
import { DashboardComponent } from './components/dashboard/dashboard';
import { LayoutComponent } from './components/shared/layout/layout';
import { authGuard } from './guards/auth-guard';
import { WeeklyReportComponent } from './components/reports/weekly-report/weekly-report';
import { ReportHistoryComponent } from './components/reports/report-history/report-history';
import { ReportDetailComponent } from './components/reports/report-detail/report-detail';
import { ManagerReviewComponent } from './components/reports/manager-review/manager-review';
import { TeamReportsComponent } from './components/reports/team-reports/team-reports';
import { UserListComponent } from './components/users/user-list/user-list';
import { ProjectListComponent } from './components/projects/project-list/project-list';


export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'reports/my-report', component: WeeklyReportComponent },
      { path: 'reports/my-report/:id', component: WeeklyReportComponent },
      { path: 'reports/history', component: ReportHistoryComponent },
      { path: 'reports/detail/:id', component: ReportDetailComponent },
      { path: 'reports/review/:id', component: ManagerReviewComponent },
      { path: 'reports/team', component: TeamReportsComponent },
      { path: 'users', component: UserListComponent },
      { path: 'projects', component: ProjectListComponent },
     
    ],
  },
  { path: '**', redirectTo: '/login' },
];