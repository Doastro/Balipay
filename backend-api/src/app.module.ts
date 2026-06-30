import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { entities } from "./database/entities";
import { AuthModule } from "./auth/auth.module";
import { MerchantsModule } from "./merchants/merchants.module";
import { TerminalsModule } from "./terminals/terminals.module";
import { TransactionsModule } from "./transactions/transactions.module";
import { RefundsModule } from "./refunds/refunds.module";
import { ClosingsModule } from "./closings/closings.module";
import { DashboardModule } from "./dashboard/dashboard.module";
import { AuditModule } from "./audit/audit.module";
import { HealthModule } from "./health/health.module";
import { SeedService } from "./database/seed.service";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "postgres",
      url: process.env.DATABASE_URL || "postgres://balipay:balipay_dev_password@localhost:5432/balipay",
      entities,
      synchronize: process.env.NODE_ENV !== "production",
      ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : false,
    }),
    TypeOrmModule.forFeature(entities),
    AuthModule,
    AuditModule,
    MerchantsModule,
    TerminalsModule,
    TransactionsModule,
    RefundsModule,
    ClosingsModule,
    DashboardModule,
    HealthModule,
  ],
  providers: [SeedService],
})
export class AppModule {}
