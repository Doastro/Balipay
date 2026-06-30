import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import { AuditService } from "../audit/audit.service";
import { AuthedRequest } from "../common/request-user";
import { MerchantStatus } from "../database/entities";
import { MerchantsService } from "./merchants.service";

@Controller("merchants")
@UseGuards(AuthGuard)
export class MerchantsController {
  constructor(
    private readonly merchants: MerchantsService,
    private readonly audit: AuditService,
  ) {}

  @Get()
  list(@Query() query: { status?: MerchantStatus; city?: string; sector?: string }) {
    return this.merchants.list(query);
  }

  @Post()
  async create(@Body() body: any, @Req() request: AuthedRequest) {
    const merchant = await this.merchants.create(body);
    await this.audit.record(request.user, "MERCHANT_CREATED", "Merchant", merchant.id, { displayName: merchant.displayName });
    return merchant;
  }

  @Get(":id")
  get(@Param("id") id: string) {
    return this.merchants.get(id);
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() body: any, @Req() request: AuthedRequest) {
    const merchant = await this.merchants.update(id, body);
    await this.audit.record(request.user, "MERCHANT_UPDATED", "Merchant", merchant.id, { status: merchant.status });
    return merchant;
  }

  @Post(":id/stores")
  async addStore(@Param("id") id: string, @Body() body: any, @Req() request: AuthedRequest) {
    const store = await this.merchants.addStore(id, body);
    await this.audit.record(request.user, "STORE_CREATED", "Store", store.id, { merchantId: id });
    return store;
  }
}
