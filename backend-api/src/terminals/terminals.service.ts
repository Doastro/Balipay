import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Store, Terminal, TerminalStatus } from "../database/entities";

@Injectable()
export class TerminalsService {
  constructor(
    @InjectRepository(Terminal) private readonly terminals: Repository<Terminal>,
    @InjectRepository(Store) private readonly stores: Repository<Store>,
  ) {}

  list() {
    return this.terminals.find({ relations: { store: { merchant: true } }, order: { createdAt: "DESC" } });
  }

  create(input: Partial<Terminal> & { serialNumber: string; model: string }) {
    return this.terminals.save(
      this.terminals.create({
        ...input,
        provider: input.provider || "BALIPAY",
        status: input.status || TerminalStatus.AVAILABLE,
      }),
    );
  }

  async assign(id: string, storeId: string) {
    const terminal = await this.terminals.findOne({ where: { id } });
    if (!terminal) throw new NotFoundException("Terminal introuvable");
    const store = await this.stores.findOne({ where: { id } });
    if (!store) throw new NotFoundException("Boutique introuvable");
    terminal.store = store;
    terminal.status = TerminalStatus.ASSIGNED;
    return this.terminals.save(terminal);
  }
}
