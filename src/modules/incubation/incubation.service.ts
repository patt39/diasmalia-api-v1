import { Injectable } from '@nestjs/common';
import { Incubation, Prisma } from '@prisma/client';
import { DatabaseService } from '../../app/database/database.service';
import {
  WithPaginationResponse,
  withPagination,
} from '../../app/utils/pagination';
import {
  CreateEggHavestingsOptions,
  GetOneIncubationSelections,
  IncubationsSelect,
  IncubationsSelections,
  UpdateIncubationsOptions,
  UpdateIncubationsSelections,
} from './incubation.type';

@Injectable()
export class IncubationsService {
  constructor(private readonly client: DatabaseService) {}

  async findAll(
    selections: IncubationsSelections,
  ): Promise<WithPaginationResponse | null> {
    const prismaWhere = {} as Prisma.IncubationWhereInput;
    const { search, organizationId, pagination } = selections;

    if (search) {
      Object.assign(prismaWhere, {
        OR: [
          {
            quantity: { contains: search, mode: 'insensitive' },
          },
        ],
      });
    }

    if (organizationId) {
      Object.assign(prismaWhere, { organizationId });
    }

    const incubations = await this.client.incubation.findMany({
      where: { ...prismaWhere, deletedAt: null },
      take: pagination.take,
      skip: pagination.skip,
      select: IncubationsSelect,
      orderBy: pagination.orderBy,
    });

    const rowCount = await this.client.incubation.count({
      where: { ...prismaWhere, deletedAt: null },
    });

    return withPagination({
      pagination,
      rowCount,
      value: incubations,
    });
  }
  /** Find one incubation in database. */
  async findOneBy(selections: GetOneIncubationSelections) {
    const prismaWhere = {} as Prisma.IncubationWhereInput;
    const { incubationId, organizationId } = selections;

    if (incubationId) {
      Object.assign(prismaWhere, { id: incubationId });
    }

    if (organizationId) {
      Object.assign(prismaWhere, { organizationId });
    }

    const incubation = await this.client.incubation.findFirst({
      where: { ...prismaWhere, deletedAt: null },
      select: IncubationsSelect,
    });

    return incubation;
  }

  /** Create one incubation in database. */
  async createOne(options: CreateEggHavestingsOptions): Promise<Incubation> {
    const {
      note,
      date,
      dueDate,
      quantity,
      batchId,
      organizationId,
      userCreatedId,
    } = options;

    const incubation = this.client.incubation.create({
      data: {
        note,
        date,
        dueDate,
        quantity,
        batchId,
        organizationId,
        userCreatedId,
      },
    });

    return incubation;
  }

  /** Update one incubation in database. */
  async updateOne(
    selections: UpdateIncubationsSelections,
    options: UpdateIncubationsOptions,
  ): Promise<Incubation> {
    const { incubationId } = selections;
    const {
      note,
      date,
      dueDate,
      quantity,
      organizationId,
      userCreatedId,
      batchId,
    } = options;

    const incubation = this.client.incubation.update({
      where: {
        id: incubationId,
      },
      data: {
        note,
        date,
        dueDate,
        quantity,
        batchId,
        organizationId,
        userCreatedId,
      },
    });

    return incubation;
  }
}
