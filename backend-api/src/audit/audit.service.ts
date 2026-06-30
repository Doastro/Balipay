import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { RequestUser } from "../common/request-user";
import { AuditLog } from "../database/entities";

@Injectable()
export class AuditService {
  constructor(@InjectRepository(AuditLog) private readonly auditLogs: Repository<AuditLog>) {}

  record(actor: RequestUser, action: string, entityType: string, entityId?: string, metadata?: Record<string, unknown>) {
    return this.auditLogs.save(
      this.auditLogs.create({
        actorId: actor.id,
        actorEmail: actor.email,
        action,
        entityType,
        entityId,
        metadata,
      }),
    );
  }

  list() {
    return this.auditLogs.find({ order: { createdAt: "DESC" }, take: 200 });
  }
}
