import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { AuditService } from "../audit/audit.service";
import { AuthGuard } from "../auth/auth.guard";
import { AuthedRequest } from "../common/request-user";
import { TerminalsService } from "./terminals.service";

@Controller("terminals")
@UseGuards(AuthGuard)
export class TerminalsController {
  constructor(
    private readonly terminals: TerminalsService,
    private readonly audit: AuditService,
  ) {}

  @Get()
  list() {
    return this.terminals.list();
  }

  @Post()
  async create(@Body() body: any, @Req() request: AuthedRequest) {
    const terminal = await this.terminals.create(body);
    await this.audit.record(request.user, "TERMINAL_CREATED", "Terminal", terminal.id, { serialNumber: terminal.serialNumber });
    return terminal;
  }

  @Patch(":id/assign")
  async assign(@Param("id") id: string, @Body() body: { storeId: string }, @Req() request: AuthedRequest) {
    const terminal = await this.terminals.assign(id, body.storeId);
    await this.audit.record(request.user, "TERMINAL_ASSIGNED", "Terminal", terminal.id, { storeId: body.storeId });
    return terminal;
  }
}
