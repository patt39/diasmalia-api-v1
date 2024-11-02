import { Injectable } from '@nestjs/common';
import { Cage, Prisma } from '@prisma/client';
import { DatabaseService } from '../../app/database/database.service';
import {
  WithPaginationResponse,
  withPagination,
} from '../../app/utils/pagination';
import {
  CreateCagesOptions,
  GetCagesSelections,
  GetOneCageSelections,
  UpdateCagesOptions,
  UpdateCagesSelections,
} from './cages.type';

@Injectable()
export class CagesService {
  constructor(private readonly client: DatabaseService) {}

  async findAll(
    selections: GetCagesSelections,
  ): Promise<WithPaginationResponse | null> {
    const prismaWhereCages = {} as Prisma.CageWhereInput;
    const { search, pagination } = selections;

    if (search) {
      Object.assign(prismaWhereCages, {
        OR: [{ code: { contains: search, mode: 'insensitive' } }],
      });
    }

    const cages = await this.client.cage.findMany({
      take: pagination.take,
      orderBy: pagination.orderBy,
      where: { ...prismaWhereCages, deletedAt: null },
    });
    const rowCount = await this.client.cage.count({
      where: { ...prismaWhereCages, deletedAt: null },
    });

    return withPagination({
      pagination,
      rowCount,
      value: cages,
    });
  }

  /** Find one Contact in database. */
  async findOneBy(selections: GetOneCageSelections) {
    const { cageId } = selections;
    const contact = await this.client.cage.findUnique({
      where: {
        id: cageId,
      },
    });

    return contact;
  }

  /** Create one cage in database. */
  async createOne(options: CreateCagesOptions): Promise<Cage> {
    const {
      code,
      number,
      dimension,
      animalId,
      animalTypeId,
      eggHarvested,
      organizationId,
      userCreatedId,
    } = options;

    const cage = this.client.cage.create({
      data: {
        code,
        number,
        dimension,
        animalId,
        animalTypeId,
        eggHarvested,
        organizationId,
        userCreatedId,
      },
    });

    return cage;
  }

  /** Update one cage in database. */
  async updateOne(
    selections: UpdateCagesSelections,
    options: UpdateCagesOptions,
  ): Promise<Cage> {
    const { cageId } = selections;
    const { dimension, code, userCreatedId, deletedAt } = options;

    const contact = this.client.cage.update({
      where: { id: cageId },
      data: { dimension, code, userCreatedId, deletedAt },
    });

    return contact;
  }
}
