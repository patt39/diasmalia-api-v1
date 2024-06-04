import { Injectable } from '@nestjs/common';
import { Fattening, Prisma } from '@prisma/client';
import { DatabaseService } from '../../app/database/database.service';
import {
  WithPaginationResponse,
  withPagination,
} from '../../app/utils/pagination';
import {
  CreateFatteningsOptions,
  GetFatteningsSelections,
  GetOneFatteningSelections,
  UpdateFatteningsOptions,
  UpdateFatteningsSelections,
  fatteningsSelect,
} from './fattening.type';

@Injectable()
export class FatteningsService {
  constructor(private readonly client: DatabaseService) {}

  async findAll(
    selections: GetFatteningsSelections,
  ): Promise<WithPaginationResponse | null> {
    const prismaWhere = {} as Prisma.FatteningWhereInput;
    const { search, animalTypeId, pagination } = selections;

    if (search) {
      Object.assign(prismaWhere, {
        OR: [{ animal: { code: { contains: search, mode: 'insensitive' } } }],
      });
    }

    if (animalTypeId) {
      Object.assign(prismaWhere, { animalTypeId });
    }

    const fattenings = await this.client.fattening.findMany({
      where: { ...prismaWhere, deletedAt: null },
      take: pagination.take,
      skip: pagination.skip,
      select: fatteningsSelect,
      orderBy: pagination.orderBy,
    });

    const rowCount = await this.client.fattening.count({
      where: { ...prismaWhere, deletedAt: null },
    });

    return withPagination({
      pagination,
      rowCount,
      value: fattenings,
    });
  }

  /** Find one fattening in database. */
  async findOneBy(selections: GetOneFatteningSelections) {
    const prismaWhere = {} as Prisma.FatteningWhereInput;

    const { fatteningId, animalTypeId, animalId, organizationId } = selections;

    if (fatteningId) {
      Object.assign(prismaWhere, { id: fatteningId });
    }

    if (organizationId) {
      Object.assign(prismaWhere, { organizationId });
    }

    if (animalId) {
      Object.assign(prismaWhere, { animalId });
    }

    if (animalTypeId) {
      Object.assign(prismaWhere, { animalTypeId });
    }

    const fattening = await this.client.fattening.findFirst({
      where: { ...prismaWhere, deletedAt: null },
      select: fatteningsSelect,
    });

    return fattening;
  }

  /** Create one fattening in database. */
  async createOne(options: CreateFatteningsOptions): Promise<Fattening> {
    const {
      animalId,
      initialWeight,
      actualWeight,
      animalTypeId,
      organizationId,
      userCreatedId,
    } = options;

    const fattening = this.client.fattening.create({
      data: {
        animalId,
        initialWeight,
        actualWeight,
        animalTypeId,
        organizationId,
        userCreatedId,
      },
    });

    return fattening;
  }

  /** Update one fattening in database. */
  async updateOne(
    selections: UpdateFatteningsSelections,
    options: UpdateFatteningsOptions,
  ): Promise<Fattening> {
    const { fatteningId } = selections;
    const { actualWeight, deletedAt, updatedAt } = options;

    const Fattening = this.client.fattening.update({
      where: { id: fatteningId },
      data: {
        actualWeight,
        updatedAt,
        deletedAt,
      },
    });

    return Fattening;
  }
}
