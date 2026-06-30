import { Body, Controller, Get, Post, Query, Req, UseGuards } from "@nestjs/common";
import { AuditService } from "../audit/audit.service";
import { AuthGuard } from "../auth/auth.guard";
import { AuthedRequest } from "../common/request-user";
import { TransactionStatus } from "../database/entities";
import { TransactionsService } from "./transactions.service";

@Controller("transactions")
@UseGuards(AuthGuard)
export class TransactionsController {
  constructor(
    private readonly transactions: TransactionsService,
    private readonly audit: AuditService,
  ) {}

  @Get()
  list(@Query() query: { merchantId?: string; status?: TransactionStatus; paymentMethod?: string }) {
    return this.transactions.list(query);
  }

  @Post("mock")
  async createMock(@Body() body: any, @Req() request: AuthedRequest) {
    const transaction = await this.transactions.createMock(body);
    await this.audit.record(request.user, "TRANSACTION_MOCK_CREATED", "PaymentTransaction", transaction.id, {
      amount: transaction.amount,
      paymentMethod: transaction.paymentMethod,
    });
    return transaction;
  }
}
