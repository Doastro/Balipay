import { Injectable, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcryptjs";
import { Repository } from "typeorm";
import { AdminRole, AdminUser, Merchant, MerchantStatus, Store, Terminal, TerminalStatus } from "./entities";

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(AdminUser) private readonly admins: Repository<AdminUser>,
    @InjectRepository(Merchant) private readonly merchants: Repository<Merchant>,
    @InjectRepository(Store) private readonly stores: Repository<Store>,
    @InjectRepository(Terminal) private readonly terminals: Repository<Terminal>,
  ) {}

  async onModuleInit() {
    const adminEmail = process.env.ADMIN_EMAIL || "admin@balipay.fr";
    const adminPassword = process.env.ADMIN_PASSWORD || "ChangeMe123!";
    const existingAdmin = await this.admins.findOne({ where: { email: adminEmail } });
    if (!existingAdmin) {
      await this.admins.save(
        this.admins.create({
          email: adminEmail,
          name: "Admin Balipay",
          role: AdminRole.SUPER_ADMIN,
          passwordHash: await bcrypt.hash(adminPassword, 12),
        }),
      );
    }

    const merchantCount = await this.merchants.count();
    if (merchantCount === 0) {
      const merchant = await this.merchants.save(
        this.merchants.create({
          legalName: "Lotus Bleu SAS",
          displayName: "Restaurant Lotus Bleu",
          siret: "00000000000000",
          contactName: "Mme Chen",
          contactEmail: "contact@lotus-bleu.example",
          contactPhone: "+33 1 00 00 00 00",
          sector: "Restaurant",
          city: "Paris 13e",
          status: MerchantStatus.KYB_PENDING,
          salesOwner: "Balipay Ops",
          internalNotes: "Commerçant pilote pour valider le parcours back-office.",
        }),
      );
      const store = await this.stores.save(
        this.stores.create({
          merchant,
          name: "Lotus Bleu Paris 13",
          address: "Avenue de Choisy",
          postalCode: "75013",
          city: "Paris",
          sector: "Restaurant",
          salesOwner: "Balipay Ops",
        }),
      );
      await this.terminals.save(
        this.terminals.create({
          serialNumber: "BP-DEMO-001",
          model: "Android TPE",
          provider: "BALIPAY",
          status: TerminalStatus.ASSIGNED,
          store,
        }),
      );
    }
  }
}
