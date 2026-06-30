import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PaymentTransaction, Refund, RefundStatus } from "../database/entities";

@Injectable()
export class RefundsService {
  constructor(
    @InjectRepository(Refund) private readonly refunds: Repository<Refund>,
    @InjectRepository(PaymentTransaction) private readonly transactions: Repository<PaymentTransaction>,
  ) {}

  list() {
    return this.refunds.find({ relations: { transaction: { merchant: true } }, order: { createdAt: "DESC" } });
  }

  async create(input: { transactionId: string; amount: number; reason?: string; status?: RefundStatus }) {
    const transaction = await this.transactions.findOne({ where: { id: input.transactionId }, relations: { merchant: true } });
    if (!transaction) throw new NotFoundException("Transaction introuvable");
    return this.refunds.save(
      this.refunds.create({
        transaction,
        amount: input.amount.toFixed(2),
        status: input.status || RefundStatus.REQUESTED,
        reason: input.reason,
      }),
    );
  }
}
