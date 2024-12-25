import { Injectable } from '@nestjs/common';
import { Farrowing, Prisma } from '@prisma/client';
import {
  dateTimeNowUtc,
  lastDayMonth,
  substrateDaysToTimeNowUtcDate,
} from 'src/app/utils/commons';
import { DatabaseService } from '../../app/database/database.service';
import {
  WithPaginationResponse,
  withPagination,
} from '../../app/utils/pagination';
import { groupCountAnimalFarrowingsAnalyticsByDateAndReturnArray } from './farrowings.analytics.utils';
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
    const { farrowingId, animalTypeId, animalId, breedingId, createdAt } =
      selections;

    if (farrowingId) {
      Object.assign(prismaWhere, { id: farrowingId });
    }

    if (animalId) {
      Object.assign(prismaWhere, { animalId });
    }

    if (breedingId) {
      Object.assign(prismaWhere, { breedingId });
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
      breedingId,
      animalTypeId,
      userCreatedId,
      farrowingDate,
      organizationId,
    } = options;

    const farrowing = this.client.farrowing.create({
      data: {
        note,
        dead,
        litter,
        weight,
        animalId,
        breedingId,
        farrowingDate,
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
    const {
      note,
      dead,
      weight,
      litter,
      animalId,
      userCreatedId,
      deletedAt,
      farrowingDate,
    } = options;

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
        farrowingDate,
      },
    });

    return farrowing;
  }

  /** Get animal farrowings analytics. */
  async getAnimalFarrowingsAnalytics(selections: GetFarrowingsSelections) {
    const prismaWhere = {} as Prisma.FarrowingWhereInput;
    const { animalTypeId, animalId, months, year, organizationId } = selections;

    if (animalTypeId) {
      Object.assign(prismaWhere, { animalTypeId });
    }

    if (year) {
      Object.assign(prismaWhere, {
        createdAt: {
          gte: new Date(`${Number(year)}-01-01`),
          lte: new Date(`${Number(year) + 1}-01-01`),
        },
      });
      if (months) {
        Object.assign(prismaWhere, {
          createdAt: {
            gte: new Date(`${year}-${months}-01`),
            lte: lastDayMonth({
              year: Number(year),
              month: Number(months),
            }),
          },
        });
      }
    }

    if (animalId) {
      Object.assign(prismaWhere, { animalId });
    }

    if (organizationId) {
      Object.assign(prismaWhere, { organizationId });
    }

    const groupFarrowingsAnalytics = await this.client.farrowing.groupBy({
      by: ['createdAt', 'organizationId', 'animalTypeId', 'animalId'],
      where: {
        ...prismaWhere,
        animal: { status: 'ACTIVE', deletedAt: null },
        deletedAt: null,
      },
      _sum: {
        litter: true,
      },
      _count: true,
    });

    const farrowingsAnalytics =
      groupCountAnimalFarrowingsAnalyticsByDateAndReturnArray({
        data: groupFarrowingsAnalytics,
        year: year,
        month: months,
      });

    return farrowingsAnalytics;
  }
}
