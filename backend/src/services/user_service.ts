import prisma from '../config/database';

export async function getAllUsers(roleFilter?: 'TEAM_MEMBER' | 'MANAGER') {
  return prisma.user.findMany({
    where: roleFilter ? { role: roleFilter } : {},
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
    orderBy: { name: 'asc' },
  });
}

export async function updateUserRole(id: string, role: 'TEAM_MEMBER' | 'MANAGER') {
  return prisma.user.update({
    where: { id },
    data: { role },
    select: { id: true, email: true, name: true, role: true },
  });
}

export async function deleteUser(id: string) {
  return prisma.user.delete({ where: { id } });
}

export async function getUserStats(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });
  if (!user) throw new Error('User not found');

  const reports = await prisma.weeklyReport.findMany({
    where: { userId: id },
    orderBy: { weekStartDate: 'desc' },
    include: { project: true },
  });

  const statusCounts = { DRAFT: 0, SUBMITTED: 0, NEEDS_CORRECTION: 0, APPROVED: 0 };
  reports.forEach((r) => { statusCounts[r.status]++; });

  return { user, reports, statusCounts };
}