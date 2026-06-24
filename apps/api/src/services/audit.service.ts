import { prisma } from "database";

export async function logAudit(
  action: string,
  entityId: string,
  metadata?: any,
) {
  return prisma.auditLog.create({
    data: {
      entityType: "JOB",
      entityId,
      action,
      metadata,
    },
  });
}
