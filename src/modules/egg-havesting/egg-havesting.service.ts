import { Injectable } from '@nestjs/common';
import { EggHavesting, Prisma } from '@prisma/client';
import { DatabaseService } from '../../app/database/database.service';
import {
  WithPaginationResponse,
  withPagination,
} from '../../app/utils/pagination';
import {
  CreateEggHavestingsOptions,
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
    const { search, size, animalTypeId, method, organizationId, pagination } =
      selections;

    if (search) {
      Object.assign(prismaWhere, {
        OR: [{ date: { contains: search, mode: 'insensitive' } }],
      });
    }

    if (size) {
      Object.assign(prismaWhere, { size });
    }

    if (method) {
      Object.assign(prismaWhere, { method });
    }

    if (animalTypeId) {
      Object.assign(prismaWhere, { animalTypeId });
    }

    if (organizationId) {
      Object.assign(prismaWhere, { organizationId });
    }

    const eggHavestings = await this.client.eggHavesting.findMany({
      where: { ...prismaWhere, deletedAt: null },
      take: pagination.take,
      skip: pagination.skip,
      //select: EggHarvestingsSelect,
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
    const { eggHavestingId, animalTypeId, organizationId } = selections;

    if (eggHavestingId) {
      Object.assign(prismaWhere, { id: eggHavestingId });
    }

    if (organizationId) {
      Object.assign(prismaWhere, { organizationId });
    }

    if (animalTypeId) {
      Object.assign(prismaWhere, { animalTypeId });
    }

    const eggHavesting = await this.client.eggHavesting.findFirst({
      where: { ...prismaWhere, deletedAt: null },
      //select: EggHarvestingsSelect,
    });

    return eggHavesting;
  }

  /** Create one egg-havesting in database. */
  async createOne(options: CreateEggHavestingsOptions): Promise<EggHavesting> {
    const {
      note,
      date,
      size,
      method,
      quantity,
      animalId,
      animalTypeId,
      organizationId,
      userCreatedId,
    } = options;

    const egghavesting = this.client.eggHavesting.create({
      data: {
        note,
        date,
        size,
        method,
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
    const { eggHavestingId } = selections;
    const { note, date, size, method, quantity, userCreatedId } = options;

    const eggHavesting = this.client.eggHavesting.update({
      where: {
        id: eggHavestingId,
      },
      data: {
        note,
        date,
        size,
        method,
        quantity,
        userCreatedId,
      },
    });

    return eggHavesting;
  }
}
