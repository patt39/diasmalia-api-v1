import { Injectable } from '@nestjs/common';
import { Death, Prisma } from '@prisma/client';
import { DatabaseService } from '../../app/database/database.service';
import {
  WithPaginationResponse,
  withPagination,
} from '../../app/utils/pagination';
import { AnimalsService } from '../animals/animals.service';
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
  constructor(
    private readonly client: DatabaseService,
    private readonly animalsService: AnimalsService,
  ) {}

  async findAll(
    selections: GetDeathsSelections,
  ): Promise<WithPaginationResponse | null> {
    const prismaWhere = {} as Prisma.DeathWhereInput;
    const { search, animalTypeId, organizationId, pagination } = selections;

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
        date: new Date(),
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
    const { note, date, number, animalId, userCreatedId, deletedAt } = options;

    const death = this.client.death.update({
      where: { id: deathId },
      data: {
        date,
        note,
        number,
        animalId,
        userCreatedId,
        deletedAt,
      },
    });

    return death;
  }
}
