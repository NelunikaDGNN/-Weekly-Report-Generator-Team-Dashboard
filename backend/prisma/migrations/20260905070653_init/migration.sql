-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('TEAM_MEMBER', 'MANAGER');

-- CreateEnum
CREATE TYPE "public"."ReportStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'NEEDS_CORRECTION', 'APPROVED');

-- CreateEnum
CREATE TYPE "public"."Priority" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "public"."TaskType" AS ENUM ('DEVELOPMENT', 'TESTING', 'MEETINGS', 'DOCUMENTATION', 'OTHER');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL DEFAULT 'TEAM_MEMBER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserProject" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "UserProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WeeklyReport" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "weekStartDate" TIMESTAMP(3) NOT NULL,
    "weekEndDate" TIMESTAMP(3) NOT NULL,
    "status" "public"."ReportStatus" NOT NULL DEFAULT 'DRAFT',
    "currentReviewComment" TEXT,
    "optionalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeeklyReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TaskCompleted" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "taskName" TEXT NOT NULL,
    "priority" "public"."Priority" NOT NULL,
    "plannedPercentage" INTEGER NOT NULL,
    "actualPercentage" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "timePlannedHours" DOUBLE PRECISION NOT NULL,
    "timeSpentHours" DOUBLE PRECISION NOT NULL,
    "outputDeliverable" TEXT,

    CONSTRAINT "TaskCompleted_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TaskPlanned" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" "public"."Priority" NOT NULL,

    CONSTRAINT "TaskPlanned_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Blocker" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isKeyIssue" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Blocker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Achievement" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isKeyAchievement" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."HourBreakdown" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "taskType" "public"."TaskType" NOT NULL,
    "hours" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "HourBreakdown_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ReportVersion" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "snapshotData" JSONB NOT NULL,
    "managerComment" TEXT,
    "reviewerId" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReportVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Project_name_key" ON "public"."Project"("name");

-- CreateIndex
CREATE UNIQUE INDEX "UserProject_userId_projectId_key" ON "public"."UserProject"("userId", "projectId");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyReport_userId_weekStartDate_key" ON "public"."WeeklyReport"("userId", "weekStartDate");

-- CreateIndex
CREATE UNIQUE INDEX "ReportVersion_reportId_versionNumber_key" ON "public"."ReportVersion"("reportId", "versionNumber");

-- AddForeignKey
ALTER TABLE "public"."UserProject" ADD CONSTRAINT "UserProject_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserProject" ADD CONSTRAINT "UserProject_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WeeklyReport" ADD CONSTRAINT "WeeklyReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WeeklyReport" ADD CONSTRAINT "WeeklyReport_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TaskCompleted" ADD CONSTRAINT "TaskCompleted_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "public"."WeeklyReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TaskPlanned" ADD CONSTRAINT "TaskPlanned_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "public"."WeeklyReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Blocker" ADD CONSTRAINT "Blocker_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "public"."WeeklyReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Achievement" ADD CONSTRAINT "Achievement_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "public"."WeeklyReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HourBreakdown" ADD CONSTRAINT "HourBreakdown_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "public"."WeeklyReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReportVersion" ADD CONSTRAINT "ReportVersion_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "public"."WeeklyReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReportVersion" ADD CONSTRAINT "ReportVersion_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
