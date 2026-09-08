export type Role = 'TEAM_MEMBER' | 'MANAGER';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: Role;
}

export interface UserStats {
  totalReports: number;
  approvedCount: number;
  needsCorrectionCount: number;
  openBlockers: number;
}