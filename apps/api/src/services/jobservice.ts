import { prisma } from "database";

export async function createJob(data: any) {
  return prisma.job.create({
    data: {
      ...data,
      nextRunAt: data.nextRunAt ? new Date(data.nextRunAt) : null,
    },
  });
}

export async function getJobs() {
  return prisma.job.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getJob(id: string) {
  return prisma.job.findUnique({
    where: { id },
  });
}

export async function deleteJob(id: string) {
  return prisma.job.delete({
    where: { id },
  });
}
