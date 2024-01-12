import { Injectable } from '@nestjs/common';
import {
  CreateMilkingsOptions,
  GetMilkingsSelections,
  GetOneMilkingsSelections,
  UpdateMilkingsOptions,
  UpdateMilkingsSelections,
  MilkingSelect,
} from './milkings.type';
import { DatabaseService } from '../../app/database/database.service';
import {
  WithPaginationResponse,
  withPagination,
} from '../../app/utils/pagination';
import { Milking, Prisma } from '@prisma/client';

@Injectable()
export class MilkingsService {
  constructor(private readonly client: DatabaseService) {}

  async findAll(
    selections: GetMilkingsSelections,
  ): Promise<WithPaginationResponse | null> {
    const prismaWhereMedication = {} as Prisma.MilkingWhereInput;
    const { search, organizationId, pagination } = selections;

    if (search) {
      Object.assign(prismaWhereMedication, {
        OR: [
          {
            code: { contains: search, mode: 'insensitive' },
          },
        ],
      });
    }

    if (organizationId) {
      Object.assign(prismaWhereMedication, { organizationId });
    }

    const milkings = await this.client.milking.findMany({
      where: { ...prismaWhereMedication, deletedAt: null },
      take: pagination.take,
      skip: pagination.skip,
      select: MilkingSelect,
      orderBy: pagination.orderBy,
    });

    const rowCount = await this.client.milking.count({
      where: { ...prismaWhereMedication, deletedAt: null },
    });

    return withPagination({
      pagination,
      rowCount,
      value: milkings,
    });
  }

  /** Find one Milking in database. */
  async findOneBy(selections: GetOneMilkingsSelections) {
    const { milkingId } = selections;
    const milking = await this.client.milking.findUnique({
      select: MilkingSelect,
      where: {
        id: milkingId,
      },
    });

    return milking;
  }

  /** Create one Milking in database. */
  async createOne(options: CreateMilkingsOptions): Promise<Milking> {
    const {
      note,
      date,
      quantity,
      method,
      animalId,
      organizationId,
      userCreatedId,
    } = options;

    const milking = this.client.milking.create({
      data: {
        note,
        date,
        method,
        quantity,
        animalId,
        organizationId,
        userCreatedId,
      },
    });

    return milking;
  }

  /** Update one Milking in database. */
  async updateOne(
    selections: UpdateMilkingsSelections,
    options: UpdateMilkingsOptions,
  ): Promise<Milking> {
    const { milkingId } = selections;
    const {
      note,
      date,
      quantity,
      method,
      animalId,
      organizationId,
      userCreatedId,
      deletedAt,
    } = options;

    const milking = this.client.milking.update({
      where: {
        id: milkingId,
      },
      data: {
        note,
        date,
        quantity,
        method,
        animalId,
        organizationId,
        userCreatedId,
        deletedAt,
      },
    });

    return milking;
  }
}
