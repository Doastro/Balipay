import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, ILike, Repository } from "typeorm";
import { Merchant, MerchantStatus, Store } from "../database/entities";

type MerchantInput = Partial<Merchant> & {
  legalName: string;
  displayName: string;
};

type StoreInput = Partial<Store> & {
  name: string;
};

@Injectable()
export class MerchantsService {
  constructor(
    @InjectRepository(Merchant) private readonly merchants: Repository<Merchant>,
    @InjectRepository(Store) private readonly stores: Repository<Store>,
  ) {}

  list(filters: { status?: MerchantStatus; city?: string; sector?: string }) {
    const where: FindOptionsWhere<Merchant> = {};
    if (filters.status) where.status = filters.status;
    if (filters.city) where.city = ILike(`%${filters.city}%`);
    if (filters.sector) where.sector = ILike(`%${filters.sector}%`);
    return this.merchants.find({
      where,
      relations: { stores: true, documents: true },
      order: { createdAt: "DESC" },
    });
  }

  create(input: MerchantInput) {
    return this.merchants.save(
      this.merchants.create({
        ...input,
        status: input.status || MerchantStatus.LEAD,
      }),
    );
  }

  async get(id: string) {
    const merchant = await this.merchants.findOne({
      where: { id },
      relations: { stores: { terminals: true }, documents: true },
    });
    if (!merchant) throw new NotFoundException("Commerçant introuvable");
    return merchant;
  }

  async update(id: string, input: Partial<Merchant>) {
    const merchant = await this.get(id);
    Object.assign(merchant, input);
    return this.merchants.save(merchant);
  }

  async addStore(merchantId: string, input: StoreInput) {
    const merchant = await this.get(merchantId);
    return this.stores.save(this.stores.create({ ...input, merchant }));
  }
}
