export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  role?: 'TEAM_MEMBER' | 'MANAGER';
}

export interface LoginInput {
  email: string;
  password: string;
}