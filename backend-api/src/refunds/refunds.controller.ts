import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { AuditService } from "../audit/audit.service";
import { AuthGuard } from "../auth/auth.guard";
import { AuthedRequest } from "../common/request-user";
import { RefundsService } from "./refunds.service";

@Controller("refunds")
@UseGuards(AuthGuard)
export class RefundsController {
  constructor(
    private readonly refunds: RefundsService,
    private readonly audit: AuditService,
  ) {}

  @Get()
  list() {
    return this.refunds.list();
  }

  @Post()
  async create(@Body() body: any, @Req() request: AuthedRequest) {
    const refund = await this.refunds.create(body);
    await this.audit.record(request.user, "REFUND_REQUESTED", "Refund", refund.id, { amount: refund.amount });
    return refund;
  }
}
