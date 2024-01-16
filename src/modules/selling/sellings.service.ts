import { Injectable } from '@nestjs/common';
import {
  CreateSellingsOptions,
  GetSellingsSelections,
  GetOneSellingSelections,
  UpdateSellingsOptions,
  UpdateSellingsSelections,
  SellingSelect,
} from './sellings.type';
import { DatabaseService } from '../../app/database/database.service';
import {
  WithPaginationResponse,
  withPagination,
} from '../../app/utils/pagination';
import { Prisma, Selling } from '@prisma/client';

@Injectable()
export class SellingsService {
  constructor(private readonly client: DatabaseService) {}

  async findAll(
    selections: GetSellingsSelections,
  ): Promise<WithPaginationResponse | null> {
    const prismaWhere = {} as Prisma.SellingWhereInput;
    const { search, organizationId, pagination } = selections;

    if (search) {
      Object.assign(prismaWhere, {
        OR: [
          {
            code: { contains: search, mode: 'insensitive' },
          },
        ],
      });
    }

    if (organizationId) {
      Object.assign(prismaWhere, { organizationId });
    }

    const sellings = await this.client.selling.findMany({
      where: { ...prismaWhere, deletedAt: null },
      take: pagination.take,
      skip: pagination.skip,
      select: SellingSelect,
      orderBy: pagination.orderBy,
    });

    const rowCount = await this.client.selling.count({
      where: { ...prismaWhere, deletedAt: null },
    });

    return withPagination({
      pagination,
      rowCount,
      value: sellings,
    });
  }

  /** Find one selling in database. */
  async findOneBy(selections: GetOneSellingSelections) {
    const { sellingId } = selections;
    const selling = await this.client.selling.findUnique({
      select: SellingSelect,
      where: {
        id: sellingId,
      },
    });

    return selling;
  }

  /** Create one selling in database. */
  async createOne(options: CreateSellingsOptions): Promise<Selling> {
    const {
      date,
      price,
      soldTo,
      method,
      phone,
      animalId,
      organizationId,
      userCreatedId,
      note,
    } = options;

    const selling = this.client.selling.create({
      data: {
        date,
        price,
        soldTo,
        method,
        phone,
        animalId,
        organizationId,
        userCreatedId,
        note,
      },
    });

    return selling;
  }

  /** Update one selling in database. */
  async updateOne(
    selections: UpdateSellingsSelections,
    options: UpdateSellingsOptions,
  ): Promise<Selling> {
    const { sellingId } = selections;
    const {
      date,
      price,
      soldTo,
      method,
      phone,
      animalId,
      organizationId,
      userCreatedId,
      note,
      deletedAt,
    } = options;

    const selling = this.client.selling.update({
      where: {
        id: sellingId,
      },
      data: {
        date,
        price,
        soldTo,
        method,
        phone,
        animalId,
        organizationId,
        userCreatedId,
        note,
        deletedAt,
      },
    });

    return selling;
  }
}
