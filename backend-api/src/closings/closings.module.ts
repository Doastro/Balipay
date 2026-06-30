import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "../auth/auth.module";
import { AuditModule } from "../audit/audit.module";
import { DailyClosing, Merchant, PaymentTransaction } from "../database/entities";
import { ClosingsController } from "./closings.controller";
import { ClosingsService } from "./closings.service";

@Module({
  imports: [TypeOrmModule.forFeature([DailyClosing, Merchant, PaymentTransaction]), AuthModule, AuditModule],
  controllers: [ClosingsController],
  providers: [ClosingsService],
})
export class ClosingsModule {}
