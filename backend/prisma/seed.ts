import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const passwordHash = await bcrypt.hash('password123', 10);

  // Clear existing data (dev only!)
  await prisma.reportVersion.deleteMany();
  await prisma.hourBreakdown.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.blocker.deleteMany();
  await prisma.taskPlanned.deleteMany();
  await prisma.taskCompleted.deleteMany();
  await prisma.weeklyReport.deleteMany();
  await prisma.userProject.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // --- Users ---
  const manager = await prisma.user.create({
    data: { email: 'manager@test.com', passwordHash, name: 'Alex Manager', role: 'MANAGER' },
  });

  const members = await Promise.all(
    ['Priya Sharma', 'Jordan Lee', 'Sam Wilson', 'Maria Garcia', 'Tom Chen'].map((name, i) =>
      prisma.user.create({
        data: {
          email: `member${i + 1}@test.com`,
          passwordHash,
          name,
          role: 'TEAM_MEMBER',
        },
      })
    )
  );

  // --- Projects ---
  const projects = await Promise.all(
    ['Client A', 'Internal Tooling', 'R&D', 'Marketing Site'].map((name) =>
      prisma.project.create({ data: { name, description: `Work related to ${name}` } })
    )
  );

  // Assign members to projects (optional feature)
  for (const member of members) {
    const randomProject = projects[Math.floor(Math.random() * projects.length)];
    await prisma.userProject.create({
      data: { userId: member.id, projectId: randomProject.id },
    });
  }

  // --- Reports across multiple weeks with varied statuses ---
  const statuses: Array<'DRAFT' | 'SUBMITTED' | 'NEEDS_CORRECTION' | 'APPROVED'> = [
    'DRAFT',
    'SUBMITTED',
    'NEEDS_CORRECTION',
    'APPROVED',
  ];

  const priorities: Array<'HIGH' | 'MEDIUM' | 'LOW'> = ['HIGH', 'MEDIUM', 'LOW'];
  const taskTypes: Array<'DEVELOPMENT' | 'TESTING' | 'MEETINGS' | 'DOCUMENTATION' | 'OTHER'> = [
    'DEVELOPMENT',
    'TESTING',
    'MEETINGS',
    'DOCUMENTATION',
    'OTHER',
  ];

  function getWeekStart(weeksAgo: number): Date {
    const date = new Date();
    date.setDate(date.getDate() - date.getDay() - weeksAgo * 7); // start of week, N weeks ago
    date.setHours(0, 0, 0, 0);
    return date;
  }

  let reportCount = 0;

  for (const member of members) {
    for (let week = 0; week < 4; week++) {
      const weekStart = getWeekStart(week);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const randomProject = projects[Math.floor(Math.random() * projects.length)];

      const report = await prisma.weeklyReport.create({
        data: {
          userId: member.id,
          projectId: randomProject.id,
          weekStartDate: weekStart,
          weekEndDate: weekEnd,
          status,
          currentReviewComment: status === 'NEEDS_CORRECTION' ? 'Please add more detail to task outputs.' : null,
          optionalNotes: `Week ${week + 1} notes for ${member.name}`,
          tasksCompleted: {
            create: [
              {
                taskName: 'Feature implementation',
                priority: priorities[Math.floor(Math.random() * 3)],
                plannedPercentage: 100,
                actualPercentage: Math.floor(Math.random() * 40) + 60,
                status: 'In Progress',
                timePlannedHours: 20,
                timeSpentHours: 18 + Math.random() * 8,
                outputDeliverable: 'Working feature branch',
              },
            ],
          },
          tasksPlanned: {
            create: [{ description: 'Continue feature work next week', priority: 'MEDIUM' }],
          },
          blockers: {
            create:
              Math.random() > 0.6
                ? [{ description: 'Waiting on design approval', isKeyIssue: true }]
                : [],
          },
          achievements: {
            create: [{ description: 'Completed sprint milestone', isKeyAchievement: true }],
          },
          hourBreakdown: {
            create: taskTypes.map((type) => ({
              taskType: type,
              hours: Math.floor(Math.random() * 10) + 1,
            })),
          },
        },
      });

      // If status is NEEDS_CORRECTION, create a version snapshot
      if (status === 'NEEDS_CORRECTION') {
        await prisma.reportVersion.create({
          data: {
            reportId: report.id,
            versionNumber: 1,
            snapshotData: { note: 'Original submission before correction request' },
            managerComment: 'Please add more detail to task outputs.',
            reviewerId: manager.id,
          },
        });
      }

      reportCount++;
    }
  }

  console.log(`Seeded: 1 manager, ${members.length} team members, ${projects.length} projects, ${reportCount} reports`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });