import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "../auth/auth.module";
import { AuditModule } from "../audit/audit.module";
import { Store, Terminal } from "../database/entities";
import { TerminalsController } from "./terminals.controller";
import { TerminalsService } from "./terminals.service";

@Module({
  imports: [TypeOrmModule.forFeature([Terminal, Store]), AuthModule, AuditModule],
  controllers: [TerminalsController],
  providers: [TerminalsService],
})
export class TerminalsModule {}
