import { Injectable } from '@nestjs/common';
import { Farrowing, Prisma } from '@prisma/client';
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
  CreateFarrowingsOptions,
  FarrowingSelect,
  GetFarrowingsSelections,
  GetOneFarrowingsSelections,
  UpdateFarrowingsOptions,
  UpdateFarrowingsSelections,
} from './farrowings.type';

@Injectable()
export class FarrowingsService {
  constructor(private readonly client: DatabaseService) {}

  async findAll(
    selections: GetFarrowingsSelections,
  ): Promise<WithPaginationResponse | null> {
    const prismaWhere = {} as Prisma.FarrowingWhereInput;
    const { search, periode, organizationId, animalTypeId, pagination } =
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

    const farrowings = await this.client.farrowing.findMany({
      where: {
        ...prismaWhere,
        deletedAt: null,
        animal: {
          status: 'ACTIVE',
          deletedAt: null,
        },
      },
      take: pagination.take,
      skip: pagination.skip,
      select: FarrowingSelect,
      orderBy: pagination.orderBy,
    });

    const rowCount = await this.client.farrowing.count({
      where: { ...prismaWhere, deletedAt: null },
    });

    return withPagination({
      pagination,
      rowCount,
      value: farrowings,
    });
  }

  /** Find one farrowing in database. */
  async findOneBy(selections: GetOneFarrowingsSelections) {
    const prismaWhere = {} as Prisma.FarrowingWhereInput;
    const { farrowingId, animalTypeId, animalId, createdAt } = selections;

    if (farrowingId) {
      Object.assign(prismaWhere, { id: farrowingId });
    }

    if (animalId) {
      Object.assign(prismaWhere, { animalId });
    }

    if (createdAt) {
      Object.assign(prismaWhere, { createdAt });
    }

    if (animalTypeId) {
      Object.assign(prismaWhere, { animalTypeId });
    }

    const farrowing = await this.client.farrowing.findFirst({
      orderBy: { createdAt: 'desc' },
      where: { ...prismaWhere, deletedAt: null },
      select: FarrowingSelect,
    });

    return farrowing;
  }

  /** Create one farrowing in database. */
  async createOne(options: CreateFarrowingsOptions): Promise<Farrowing> {
    const {
      note,
      dead,
      litter,
      weight,
      animalId,
      animalTypeId,
      userCreatedId,
      organizationId,
    } = options;

    const farrowing = this.client.farrowing.create({
      data: {
        note,
        dead,
        litter,
        weight,
        animalId,
        animalTypeId,
        userCreatedId,
        organizationId,
      },
    });

    return farrowing;
  }

  /** Update one farrowing in database. */
  async updateOne(
    selections: UpdateFarrowingsSelections,
    options: UpdateFarrowingsOptions,
  ): Promise<Farrowing> {
    const { farrowingId } = selections;
    const { note, dead, weight, litter, animalId, userCreatedId, deletedAt } =
      options;

    const farrowing = this.client.farrowing.update({
      where: { id: farrowingId },
      data: {
        dead,
        note,
        weight,
        litter,
        animalId,
        userCreatedId,
        deletedAt,
      },
    });

    return farrowing;
  }
}
