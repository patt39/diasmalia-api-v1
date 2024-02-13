import { Injectable } from '@nestjs/common';
import { Farrowing, Prisma } from '@prisma/client';
import { DatabaseService } from '../../app/database/database.service';
import {
  WithPaginationResponse,
  withPagination,
} from '../../app/utils/pagination';
import {
  CreateFarrowingsOptions,
  FarrowingSelect,
  GetFarrowingsSelections,
  GetOneFarrowingsSelections,
  UpdateFarrowingsOptions,
  UpdateFarrowingsSelections,
} from './farrowings.type';

@Injectable()
export class FarrowingsService {
  constructor(private readonly client: DatabaseService) {}

  async findAll(
    selections: GetFarrowingsSelections,
  ): Promise<WithPaginationResponse | null> {
    const prismaWhere = {} as Prisma.FarrowingWhereInput;
    const { search, organizationId, pagination } = selections;

    if (search) {
      Object.assign(prismaWhere, {
        OR: [
          {
            codeFemale: { contains: search, mode: 'insensitive' },
          },
        ],
      });
    }

    if (organizationId) {
      Object.assign(prismaWhere, { organizationId });
    }

    const farrowings = await this.client.farrowing.findMany({
      where: { ...prismaWhere, deletedAt: null },
      take: pagination.take,
      skip: pagination.skip,
      select: FarrowingSelect,
      orderBy: pagination.orderBy,
    });

    const rowCount = await this.client.farrowing.count({
      where: { ...prismaWhere, deletedAt: null },
    });

    return withPagination({
      pagination,
      rowCount,
      value: farrowings,
    });
  }

  /** Find one farrowing in database. */
  async findOneBy(selections: GetOneFarrowingsSelections) {
    const prismaWhere = {} as Prisma.FarrowingWhereInput;
    const { farrowingId, litter } = selections;

    if (farrowingId) {
      Object.assign(prismaWhere, { id: farrowingId });
    }

    if (litter) {
      Object.assign(prismaWhere, { litter });
    }

    const farrowing = await this.client.farrowing.findFirst({
      where: { ...prismaWhere, deletedAt: null },
      select: FarrowingSelect,
    });

    return farrowing;
  }

  /** Create one farrowing in database. */
  async createOne(options: CreateFarrowingsOptions): Promise<Farrowing> {
    const { note, litter, date, organizationId, userCreatedId, animalId } =
      options;

    const farrowing = this.client.farrowing.create({
      data: {
        note,
        date,
        litter,
        animalId,
        organizationId,
        userCreatedId,
      },
    });

    return farrowing;
  }

  /** Update one farrowing in database. */
  async updateOne(
    selections: UpdateFarrowingsSelections,
    options: UpdateFarrowingsOptions,
  ): Promise<Farrowing> {
    const { farrowingId } = selections;
    const {
      note,
      date,
      litter,
      animalId,
      organizationId,
      userCreatedId,
      deletedAt,
    } = options;

    const farrowing = this.client.farrowing.update({
      where: {
        id: farrowingId,
      },
      data: {
        note,
        date,
        litter,
        animalId,
        organizationId,
        userCreatedId,
        deletedAt,
      },
    });

    return farrowing;
  }
}
