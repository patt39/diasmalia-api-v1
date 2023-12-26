import { Injectable } from '@nestjs/common';
import {
  CreateBreedingsOptions,
  GetBreedingsSelections,
  GetOneBreedingsSelections,
  UpdateBreedingsOptions,
  UpdateBreedingsSelections,
  BreedingSelect,
} from './breedings.type';
import { DatabaseService } from '../../app/database/database.service';
import {
  WithPaginationResponse,
  withPagination,
} from '../../app/utils/pagination';
import { Breeding, Prisma } from '@prisma/client';

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
            note: { contains: search, mode: 'insensitive' },
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

  /** Find one Breedings to the database. */
  async findOneBy(selections: GetOneBreedingsSelections) {
    const { breedingId } = selections;
    const breeding = await this.client.breeding.findUnique({
      select: BreedingSelect,
      where: {
        id: breedingId,
      },
    });

    return breeding;
  }

  /** Create one Breedings to the database. */
  async createOne(options: CreateBreedingsOptions): Promise<Breeding> {
    const { date, note, method, animalId, organizationId, userCreatedId } =
      options;

    const breeding = this.client.breeding.create({
      data: {
        date,
        note,
        method,
        animalId,
        organizationId,
        userCreatedId,
      },
    });

    return breeding;
  }

  /** Update one Breedings to the database. */
  async updateOne(
    selections: UpdateBreedingsSelections,
    options: UpdateBreedingsOptions,
  ): Promise<Breeding> {
    const { breedingId } = selections;
    const { date, note, method, animalId, deletedAt } = options;

    const breeding = this.client.breeding.update({
      where: {
        id: breedingId,
      },
      data: {
        date,
        note,
        method,
        animalId,
        deletedAt,
      },
    });

    return breeding;
  }
}
