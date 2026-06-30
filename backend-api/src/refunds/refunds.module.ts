import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "../auth/auth.module";
import { AuditModule } from "../audit/audit.module";
import { PaymentTransaction, Refund } from "../database/entities";
import { RefundsController } from "./refunds.controller";
import { RefundsService } from "./refunds.service";

@Module({
  imports: [TypeOrmModule.forFeature([Refund, PaymentTransaction]), AuthModule, AuditModule],
  controllers: [RefundsController],
  providers: [RefundsService],
})
export class RefundsModule {}
