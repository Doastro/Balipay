import { Body, Controller, Get, Post, Query, Req, UseGuards } from "@nestjs/common";
import { AuditService } from "../audit/audit.service";
import { AuthGuard } from "../auth/auth.guard";
import { AuthedRequest } from "../common/request-user";
import { ClosingsService } from "./closings.service";

@Controller("closings/daily")
@UseGuards(AuthGuard)
export class ClosingsController {
  constructor(
    private readonly closings: ClosingsService,
    private readonly audit: AuditService,
  ) {}

  @Get()
  list(@Query() query: { merchantId?: string; date?: string }) {
    return this.closings.list(query);
  }

  @Post()
  async create(@Body() body: any, @Req() request: AuthedRequest) {
    const closing = await this.closings.create(body);
    await this.audit.record(request.user, "DAILY_CLOSING_CREATED", "DailyClosing", closing.id, {
      merchantId: body.merchantId,
      businessDate: body.businessDate,
      gapAmount: closing.gapAmount,
    });
    return closing;
  }
}
