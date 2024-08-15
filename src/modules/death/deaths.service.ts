import { Injectable } from '@nestjs/common';
import { Death, Prisma } from '@prisma/client';
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
  CreateDeathsOptions,
  DeathSelect,
  GetDeathsSelections,
  GetOneDeathSelections,
  UpdateDeathsOptions,
  UpdateDeathsSelections,
} from './deaths.type';

@Injectable()
export class DeathsService {
  constructor(private readonly client: DatabaseService) {}

  async findAll(
    selections: GetDeathsSelections,
  ): Promise<WithPaginationResponse | null> {
    const prismaWhere = {} as Prisma.DeathWhereInput;
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

    const deaths = await this.client.death.findMany({
      where: { ...prismaWhere, deletedAt: null },
      take: pagination.take,
      skip: pagination.skip,
      select: DeathSelect,
      orderBy: pagination.orderBy,
    });

    const rowCount = await this.client.death.count({
      where: { ...prismaWhere, deletedAt: null },
    });

    return withPagination({
      pagination,
      rowCount,
      value: deaths,
    });
  }

  /** Find one death in database. */
  async findOneBy(selections: GetOneDeathSelections) {
    const prismaWhere = {} as Prisma.DeathWhereInput;
    const { deathId, animalTypeId, organizationId } = selections;

    if (deathId) {
      Object.assign(prismaWhere, { id: deathId });
    }

    if (organizationId) {
      Object.assign(prismaWhere, { organizationId });
    }

    if (animalTypeId) {
      Object.assign(prismaWhere, { animalTypeId });
    }

    const death = await this.client.death.findFirst({
      where: { ...prismaWhere, deletedAt: null },
      select: DeathSelect,
    });

    return death;
  }

  /** Create one death in database. */
  async createOne(options: CreateDeathsOptions): Promise<Death> {
    const {
      note,
      number,
      animalId,
      animalTypeId,
      organizationId,
      userCreatedId,
    } = options;

    const death = this.client.death.create({
      data: {
        note,
        number,
        animalId,
        animalTypeId,
        organizationId,
        userCreatedId,
      },
    });

    return death;
  }

  /** Update one Death in database. */
  async updateOne(
    selections: UpdateDeathsSelections,
    options: UpdateDeathsOptions,
  ): Promise<Death> {
    const { deathId } = selections;
    const { note, number, userCreatedId, deletedAt } = options;

    const death = this.client.death.update({
      where: { id: deathId },
      data: {
        note,
        number,
        userCreatedId,
        deletedAt,
      },
    });

    return death;
  }
}
