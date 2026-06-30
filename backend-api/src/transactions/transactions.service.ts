import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, Repository } from "typeorm";
import { Merchant, PaymentTransaction, Store, TransactionStatus } from "../database/entities";

type TransactionInput = {
  merchantId: string;
  storeId?: string;
  amount: number;
  currency?: string;
  paymentMethod: string;
  status?: TransactionStatus;
  provider?: string;
  externalTransactionId?: string;
  externalReference?: string;
};

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(PaymentTransaction) private readonly transactions: Repository<PaymentTransaction>,
    @InjectRepository(Merchant) private readonly merchants: Repository<Merchant>,
    @InjectRepository(Store) private readonly stores: Repository<Store>,
  ) {}

  list(filters: { merchantId?: string; status?: TransactionStatus; paymentMethod?: string }) {
    const where: FindOptionsWhere<PaymentTransaction> = {};
    if (filters.merchantId) where.merchant = { id: filters.merchantId } as Merchant;
    if (filters.status) where.status = filters.status;
    if (filters.paymentMethod) where.paymentMethod = filters.paymentMethod;
    return this.transactions.find({
      where,
      relations: { merchant: true, store: true },
      order: { createdAt: "DESC" },
      take: 300,
    });
  }

  async createMock(input: TransactionInput) {
    const merchant = await this.merchants.findOne({ where: { id: input.merchantId } });
    if (!merchant) throw new NotFoundException("Commerçant introuvable");
    const store = input.storeId ? await this.stores.findOne({ where: { id: input.storeId } }) : null;
    return this.transactions.save(
      this.transactions.create({
        merchant,
        store,
        amount: input.amount.toFixed(2),
        currency: input.currency || "EUR",
        paymentMethod: input.paymentMethod,
        status: input.status || TransactionStatus.PAID,
        provider: input.provider || "BALIPAY_MOCK",
        externalTransactionId: input.externalTransactionId,
        externalReference: input.externalReference,
      }),
    );
  }
}
