import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { MoreThan, Repository } from "typeorm";
import { DailyClosing, Merchant, MerchantStatus, PaymentTransaction, Refund, Terminal, TerminalStatus, TransactionStatus } from "../database/entities";

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Merchant) private readonly merchants: Repository<Merchant>,
    @InjectRepository(Terminal) private readonly terminals: Repository<Terminal>,
    @InjectRepository(PaymentTransaction) private readonly transactions: Repository<PaymentTransaction>,
    @InjectRepository(Refund) private readonly refunds: Repository<Refund>,
    @InjectRepository(DailyClosing) private readonly closings: Repository<DailyClosing>,
  ) {}

  async kpis() {
    const [activeMerchants, pendingMerchants, activeTerminals, refundsCount, failedTransactions, gapClosings] = await Promise.all([
      this.merchants.count({ where: { status: MerchantStatus.ACTIVE } }),
      this.merchants.count({ where: { status: MerchantStatus.KYB_PENDING } }),
      this.terminals.count({ where: { status: TerminalStatus.ACTIVE } }),
      this.refunds.count(),
      this.transactions.count({ where: { status: TransactionStatus.FAILED } }),
      this.closings.count({ where: { gapAmount: MoreThan("0") } }),
    ]);
    const paid = await this.transactions.find({ where: { status: TransactionStatus.PAID } });
    const volume = paid.reduce((sum, transaction) => sum + Number(transaction.amount), 0);
    return {
      activeMerchants,
      pendingMerchants,
      activeTerminals,
      transactionCount: paid.length,
      volume: Number(volume.toFixed(2)),
      refundsCount,
      failedTransactions,
      gapClosings,
      alerts: {
        pendingMerchants,
        failedTransactions,
        gapClosings,
      },
    };
  }
}
