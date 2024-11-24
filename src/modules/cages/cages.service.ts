import { Injectable } from '@nestjs/common';
import { Cage, Prisma } from '@prisma/client';
import { DatabaseService } from '../../app/database/database.service';
import {
  withPagination,
  WithPaginationResponse,
} from '../../app/utils/pagination';
import {
  cagesSelect,
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
    const { search, pagination, organizationId, animalId } = selections;

    if (search) {
      Object.assign(prismaWhereCages, {
        OR: [{ code: { contains: search, mode: 'insensitive' } }],
      });
    }

    if (animalId) {
      Object.assign(prismaWhereCages, { animalId });
    }

    if (organizationId) {
      Object.assign(prismaWhereCages, { organizationId });
    }

    const cages = await this.client.cage.findMany({
      take: pagination.take,
      orderBy: pagination.orderBy,
      select: cagesSelect,
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

  async countAnimalsInCages({
    animalId,
    animalTypeId,
    organizationId,
  }: {
    animalId?: string;
    animalTypeId?: string;
    organizationId?: string;
  }) {
    const prismaWhereCages = {} as Prisma.CageWhereInput;

    const cages = await this.client.cage.aggregate({
      where: {
        deletedAt: null,
        ...prismaWhereCages,
        animalId: animalId,
        animalTypeId: animalTypeId,
        organizationId: organizationId,
        animal: { status: 'ACTIVE', deletedAt: null },
      },
      _sum: {
        numberPerCage: true,
      },
    });

    return cages;
  }

  /** Find one cage in database. */
  async findOneBy(selections: GetOneCageSelections) {
    const prismaWhere = {} as Prisma.CageWhereInput;

    const { cageId, organizationId } = selections;

    if (cageId) {
      Object.assign(prismaWhere, { id: cageId });
    }

    if (organizationId) {
      Object.assign(prismaWhere, { organizationId });
    }

    const cage = await this.client.cage.findFirst({
      where: { ...prismaWhere, deletedAt: null },
      select: cagesSelect,
    });

    return cage;
  }

  /** Create one cage in database. */
  async createOne(options: CreateCagesOptions): Promise<Cage> {
    const {
      code,
      death,
      dimension,
      animalId,
      numberPerCage,
      animalTypeId,
      eggHarvested,
      organizationId,
      userCreatedId,
    } = options;

    const cage = this.client.cage.create({
      data: {
        code,
        death,
        dimension,
        animalId,
        numberPerCage,
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
    const { dimension, eggHarvested, death, numberPerCage, code, deletedAt } =
      options;

    const contact = this.client.cage.update({
      where: { id: cageId },
      data: { dimension, eggHarvested, death, code, numberPerCage, deletedAt },
    });

    return contact;
  }

  async incrementNumber({
    cageId,
    eggHarvested,
  }: {
    cageId: string;
    eggHarvested: number;
  }): Promise<Cage> {
    const contact = this.client.cage.update({
      where: { id: cageId },
      data: { eggHarvested: { increment: Number(eggHarvested) } },
    });

    return contact;
  }
}
