import { Injectable } from '@nestjs/common';
import { Isolation, Prisma } from '@prisma/client';
import { DatabaseService } from '../../app/database/database.service';
import {
  WithPaginationResponse,
  withPagination,
} from '../../app/utils/pagination';
import {
  CreateIsolationsOptions,
  GetIsolationsSelections,
  GetOneIsolationsSelections,
  IsolationsSelect,
  UpdateIsolationsOptions,
  UpdateIsolationsSelections,
} from './isolations.type';

@Injectable()
export class IsolationsService {
  constructor(private readonly client: DatabaseService) {}

  async findAll(
    selections: GetIsolationsSelections,
  ): Promise<WithPaginationResponse | null> {
    const prismaWhere = {} as Prisma.IsolationWhereInput;
    const { search, animalTypeId, pagination } = selections;

    if (search) {
      Object.assign(prismaWhere, {
        OR: [{ animal: { code: { contains: search, mode: 'insensitive' } } }],
      });
    }

    if (animalTypeId) {
      Object.assign(prismaWhere, { animalTypeId });
    }

    const isolations = await this.client.isolation.findMany({
      where: { ...prismaWhere, deletedAt: null },
      take: pagination.take,
      skip: pagination.skip,
      select: IsolationsSelect,
      orderBy: pagination.orderBy,
    });

    const rowCount = await this.client.isolation.count({
      where: { ...prismaWhere, deletedAt: null },
    });

    return withPagination({
      pagination,
      rowCount,
      value: isolations,
    });
  }

  /** Find one isolation in database. */
  async findOneBy(selections: GetOneIsolationsSelections) {
    const prismaWhere = {} as Prisma.IsolationWhereInput;

    const { isolationId, animalTypeId, organizationId } = selections;

    if (isolationId) {
      Object.assign(prismaWhere, { id: isolationId });
    }

    if (organizationId) {
      Object.assign(prismaWhere, { organizationId });
    }

    if (animalTypeId) {
      Object.assign(prismaWhere, { animalTypeId });
    }

    const isolation = await this.client.isolation.findFirst({
      where: { ...prismaWhere, deletedAt: null },
      select: IsolationsSelect,
    });

    return isolation;
  }

  /** Create one isolation in database. */
  async createOne(options: CreateIsolationsOptions): Promise<Isolation> {
    const { note, animalId, animalTypeId, organizationId, userCreatedId } =
      options;

    const isolation = this.client.isolation.create({
      data: {
        note,
        animalId,
        animalTypeId,
        date: new Date(),
        organizationId,
        userCreatedId,
      },
    });

    return isolation;
  }

  /** Update one isolation in database. */
  async updateOne(
    selections: UpdateIsolationsSelections,
    options: UpdateIsolationsOptions,
  ): Promise<Isolation> {
    const { isolationId } = selections;
    const { note, animalId, deletedAt } = options;

    const isolation = this.client.isolation.update({
      where: { id: isolationId },
      data: { note, animalId, deletedAt },
    });

    return isolation;
  }
}
