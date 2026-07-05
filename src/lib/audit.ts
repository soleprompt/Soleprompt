import { prisma } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

export type AuditAction =
  | "purchase.completed"
  | "prompt.approved"
  | "prompt.rejected";

export async function createAuditLog({
  action,
  actorId,
  entityType,
  entityId,
  metadata,
}: {
  action: AuditAction;
  actorId?: string | null;
  entityType: string;
  entityId: string;
  metadata?: Prisma.InputJsonValue;
}) {
  await prisma.auditLog.create({
    data: {
      action,
      actorId: actorId ?? null,
      entityType,
      entityId,
      metadata: metadata ?? undefined,
    },
  });
}
