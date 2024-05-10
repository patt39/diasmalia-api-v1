import { Injectable } from '@nestjs/common';
import { Milking, Prisma } from '@prisma/client';
import { DatabaseService } from '../../app/database/database.service';
import {
  WithPaginationResponse,
  withPagination,
} from '../../app/utils/pagination';
import {
  CreateMilkingsOptions,
  GetMilkingsSelections,
  GetOneMilkingsSelections,
  MilkingSelect,
  UpdateMilkingsOptions,
  UpdateMilkingsSelections,
} from './milkings.type';

@Injectable()
export class MilkingsService {
  constructor(private readonly client: DatabaseService) {}

  async findAll(
    selections: GetMilkingsSelections,
  ): Promise<WithPaginationResponse | null> {
    const prismaWhere = {} as Prisma.MilkingWhereInput;
    const { search, method, animalTypeId, organizationId, pagination } =
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

    if (method) {
      Object.assign(prismaWhere, { method });
    }

    const milkings = await this.client.milking.findMany({
      where: { ...prismaWhere, deletedAt: null },
      take: pagination.take,
      skip: pagination.skip,
      select: MilkingSelect,
      orderBy: pagination.orderBy,
    });

    const rowCount = await this.client.milking.count({
      where: { ...prismaWhere, deletedAt: null },
    });

    return withPagination({
      pagination,
      rowCount,
      value: milkings,
    });
  }

  /** Find one milking in database. */
  async findOneBy(selections: GetOneMilkingsSelections) {
    const prismaWhere = {} as Prisma.MilkingWhereInput;
    const { milkingId, animalTypeId, organizationId } = selections;

    if (milkingId) {
      Object.assign(prismaWhere, { id: milkingId });
    }

    if (organizationId) {
      Object.assign(prismaWhere, { organizationId });
    }

    if (animalTypeId) {
      Object.assign(prismaWhere, { animalTypeId });
    }

    const milking = await this.client.milking.findFirst({
      where: { ...prismaWhere, deletedAt: null },
      select: MilkingSelect,
    });

    return milking;
  }

  /** Create one milking in database. */
  async createOne(options: CreateMilkingsOptions): Promise<Milking> {
    const {
      note,
      method,
      quantity,
      animalId,
      animalTypeId,
      organizationId,
      userCreatedId,
    } = options;

    const milking = this.client.milking.create({
      data: {
        note,
        method,
        quantity,
        animalId,
        animalTypeId,
        date: new Date(),
        organizationId,
        userCreatedId,
      },
    });

    return milking;
  }

  /** Update one milking in database. */
  async updateOne(
    selections: UpdateMilkingsSelections,
    options: UpdateMilkingsOptions,
  ): Promise<Milking> {
    const { milkingId } = selections;
    const {
      note,
      method,
      quantity,
      animalId,
      userCreatedId,
      animalTypeId,
      deletedAt,
    } = options;

    const milking = this.client.milking.update({
      where: { id: milkingId },
      data: {
        note,
        method,
        quantity,
        animalId,
        animalTypeId,
        userCreatedId,
        deletedAt,
      },
    });

    return milking;
  }
}
