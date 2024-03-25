import { Injectable } from '@nestjs/common';
import { EggHavesting, Prisma } from '@prisma/client';
import { DatabaseService } from '../../app/database/database.service';
import {
  WithPaginationResponse,
  withPagination,
} from '../../app/utils/pagination';
import {
  CreateEggHavestingsOptions,
  EggHarvestingsSelect,
  GetEggHavestingsSelections,
  GetOneEggHavestingSelections,
  UpdateEggHavestingsOptions,
  UpdateEggHavestingsSelections,
} from './egg-havesting.type';

@Injectable()
export class EggHavestingsService {
  constructor(private readonly client: DatabaseService) {}

  async findAll(
    selections: GetEggHavestingsSelections,
  ): Promise<WithPaginationResponse | null> {
    const prismaWhere = {} as Prisma.EggHavestingWhereInput;
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

    const eggHavestings = await this.client.eggHavesting.findMany({
      where: { ...prismaWhere, deletedAt: null },
      take: pagination.take,
      skip: pagination.skip,
      select: EggHarvestingsSelect,
      orderBy: pagination.orderBy,
    });

    const rowCount = await this.client.eggHavesting.count({
      where: { ...prismaWhere, deletedAt: null },
    });

    return withPagination({
      pagination,
      rowCount,
      value: eggHavestings,
    });
  }
  /** Find one egg-havesting in database. */
  async findOneBy(selections: GetOneEggHavestingSelections) {
    const prismaWhere = {} as Prisma.EggHavestingWhereInput;
    const { eggHavestingId, organizationId } = selections;

    if (eggHavestingId) {
      Object.assign(prismaWhere, { id: eggHavestingId });
    }

    if (organizationId) {
      Object.assign(prismaWhere, { organizationId });
    }

    const eggHavesting = await this.client.eggHavesting.findFirst({
      where: { ...prismaWhere, deletedAt: null },
      select: EggHarvestingsSelect,
    });

    // const weaning = await this.client.weaning.findUnique({
    //   select: WeaningSelect,
    //   where: {
    //     id: weaningId,
    //   },
    // });

    return eggHavesting;
  }

  /** Create one egg-havesting in database. */
  async createOne(options: CreateEggHavestingsOptions): Promise<EggHavesting> {
    const { note, date, quantity, batchId, organizationId, userCreatedId } =
      options;

    const egghavesting = this.client.eggHavesting.create({
      data: {
        note,
        date,
        quantity,
        batchId,
        organizationId,
        userCreatedId,
      },
    });

    return egghavesting;
  }

  /** Update one egg-havesting in database. */
  async updateOne(
    selections: UpdateEggHavestingsSelections,
    options: UpdateEggHavestingsOptions,
  ): Promise<EggHavesting> {
    const { eggHavestingId } = selections;
    const { note, date, quantity, organizationId, userCreatedId, batchId } =
      options;

    const eggHavesting = this.client.eggHavesting.update({
      where: {
        id: eggHavestingId,
      },
      data: {
        note,
        date,
        quantity,
        batchId,
        organizationId,
        userCreatedId,
      },
    });

    return eggHavesting;
  }
}
