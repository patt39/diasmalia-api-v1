import { Injectable } from '@nestjs/common';
import { Breeding, Prisma } from '@prisma/client';
import { DatabaseService } from '../../app/database/database.service';
import {
  WithPaginationResponse,
  withPagination,
} from '../../app/utils/pagination';
import {
  BreedingSelect,
  CreateBreedingsOptions,
  GetBreedingsSelections,
  GetOneBreedingsSelections,
  UpdateBreedingsOptions,
  UpdateBreedingsSelections,
} from './breedings.type';

@Injectable()
export class BreedingsService {
  constructor(private readonly client: DatabaseService) {}

  async findAll(
    selections: GetBreedingsSelections,
  ): Promise<WithPaginationResponse | null> {
    const prismaWhereBreeding = {} as Prisma.BreedingWhereInput;
    const { search, organizationId, pagination } = selections;

    if (search) {
      Object.assign(prismaWhereBreeding, {
        OR: [
          {
            codeMale: { contains: search, mode: 'insensitive' },
          },
          {
            codeFeMale: { contains: search, mode: 'insensitive' },
          },
        ],
      });
    }

    if (organizationId) {
      Object.assign(prismaWhereBreeding, { organizationId });
    }

    const breedings = await this.client.breeding.findMany({
      where: { ...prismaWhereBreeding, deletedAt: null },
      take: pagination.take,
      skip: pagination.skip,
      select: BreedingSelect,
      orderBy: pagination.orderBy,
    });

    const rowCount = await this.client.breeding.count({
      where: { ...prismaWhereBreeding, deletedAt: null },
    });

    return withPagination({
      pagination,
      rowCount,
      value: breedings,
    });
  }

  /** Find one breeding in database. */
  async findOneBy(selections: GetOneBreedingsSelections) {
    const prismaWhere = {} as Prisma.BreedingWhereInput;

    const { breedingId, organizationId, checkStatus } = selections;

    if (breedingId) {
      Object.assign(prismaWhere, { id: breedingId });
    }

    if (organizationId) {
      Object.assign(prismaWhere, { organizationId });
    }

    if (checkStatus) {
      Object.assign(prismaWhere, { checkStatus });
    }

    const breeding = await this.client.breeding.findFirst({
      where: { ...prismaWhere, deletedAt: null },
    });

    return breeding;
  }

  /** Create one breeding in database. */
  async createOne(options: CreateBreedingsOptions): Promise<Breeding> {
    const {
      date,
      note,
      method,
      animalFemaleId,
      animalMaleId,
      organizationId,
      userCreatedId,
    } = options;

    const breeding = this.client.breeding.create({
      data: {
        date,
        note,
        method,
        animalFemaleId,
        animalMaleId,
        organizationId,
        userCreatedId,
      },
    });

    return breeding;
  }

  /** Update one breeding in database. */
  async updateOne(
    selections: UpdateBreedingsSelections,
    options: UpdateBreedingsOptions,
  ): Promise<Breeding> {
    const { breedingId } = selections;
    const { date, note, method, animalFemaleId, animalMaleId, deletedAt } =
      options;

    const breeding = this.client.breeding.update({
      where: {
        id: breedingId,
      },
      data: {
        date,
        note,
        method,
        animalFemaleId,
        animalMaleId,
        deletedAt,
      },
    });

    return breeding;
  }
}
