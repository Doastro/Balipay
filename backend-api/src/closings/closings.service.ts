import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Between, Repository } from "typeorm";
import { ClosingStatus, DailyClosing, Merchant, PaymentTransaction, TransactionStatus } from "../database/entities";

@Injectable()
export class ClosingsService {
  constructor(
    @InjectRepository(DailyClosing) private readonly closings: Repository<DailyClosing>,
    @InjectRepository(Merchant) private readonly merchants: Repository<Merchant>,
    @InjectRepository(PaymentTransaction) private readonly transactions: Repository<PaymentTransaction>,
  ) {}

  list(filters: { merchantId?: string; date?: string }) {
    const where: any = {};
    if (filters.merchantId) where.merchant = { id: filters.merchantId };
    if (filters.date) where.businessDate = filters.date;
    return this.closings.find({ where, relations: { merchant: true }, order: { createdAt: "DESC" } });
  }

  async create(input: { merchantId: string; businessDate: string; totalPayments?: number; status?: ClosingStatus; comment?: string }) {
    const merchant = await this.merchants.findOne({ where: { id: input.merchantId } });
    if (!merchant) throw new NotFoundException("Commerçant introuvable");
    const dayStart = new Date(`${input.businessDate}T00:00:00.000Z`);
    const dayEnd = new Date(`${input.businessDate}T23:59:59.999Z`);
    const paidTransactions = await this.transactions.find({
      where: {
        merchant: { id: input.merchantId } as Merchant,
        status: TransactionStatus.PAID,
        createdAt: Between(dayStart, dayEnd),
      },
    });
    const totalSales = paidTransactions.reduce((sum, transaction) => sum + Number(transaction.amount), 0);
    const totalPayments = input.totalPayments ?? totalSales;
    return this.closings.save(
      this.closings.create({
        merchant,
        businessDate: input.businessDate,
        totalSales: totalSales.toFixed(2),
        totalPayments: totalPayments.toFixed(2),
        gapAmount: (totalPayments - totalSales).toFixed(2),
        status: input.status || ClosingStatus.DRAFT,
        comment: input.comment,
      }),
    );
  }
}
