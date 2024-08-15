import { Injectable } from '@nestjs/common';
import { EggHavesting, Prisma } from '@prisma/client';
import {
  dateTimeNowUtc,
  substrateDaysToTimeNowUtcDate,
} from 'src/app/utils/commons';
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
    const { search, periode, animalTypeId, organizationId, pagination } =
      selections;

    if (search) {
      Object.assign(prismaWhere, {
        OR: [{ animal: { code: { contains: search, mode: 'insensitive' } } }],
      });
    }

    if (animalTypeId) {
      Object.assign(prismaWhere, { animalTypeId });
    }

    if (organizationId) {
      Object.assign(prismaWhere, { organizationId });
    }

    if (periode) {
      Object.assign(prismaWhere, {
        createdAt: {
          gte: substrateDaysToTimeNowUtcDate(Number(periode)),
          lte: dateTimeNowUtc(),
        },
      });
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
    const { eggHarvestingId, animalTypeId, organizationId } = selections;

    if (eggHarvestingId) {
      Object.assign(prismaWhere, { id: eggHarvestingId });
    }

    if (organizationId) {
      Object.assign(prismaWhere, { organizationId });
    }

    if (animalTypeId) {
      Object.assign(prismaWhere, { animalTypeId });
    }

    const eggHavesting = await this.client.eggHavesting.findFirst({
      where: { ...prismaWhere, deletedAt: null },
      select: EggHarvestingsSelect,
    });

    return eggHavesting;
  }

  /** Create one egg-havesting in database. */
  async createOne(options: CreateEggHavestingsOptions): Promise<EggHavesting> {
    const {
      size,
      quantity,
      animalId,
      animalTypeId,
      organizationId,
      userCreatedId,
    } = options;

    const egghavesting = this.client.eggHavesting.create({
      data: {
        size,
        quantity,
        animalId,
        animalTypeId,
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
    const { eggHarvestingId } = selections;
    const { size, quantity, animalId, userCreatedId, deletedAt } = options;

    const eggHarvesting = this.client.eggHavesting.update({
      where: { id: eggHarvestingId },
      data: {
        size,
        quantity,
        animalId,
        deletedAt,
        userCreatedId,
      },
    });

    return eggHarvesting;
  }
}
