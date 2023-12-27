import { Injectable } from '@nestjs/common';
import {
  CreateFarrowingsOptions,
  GetFarrowingsSelections,
  GetOneFarrowingsSelections,
  UpdateFarrowingsOptions,
  UpdateFarrowingsSelections,
  FarrowingSelect,
} from './farrowings.type';
import { DatabaseService } from '../../app/database/database.service';
import {
  WithPaginationResponse,
  withPagination,
} from '../../app/utils/pagination';
import { Prisma, Farrowing } from '@prisma/client';

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
            farrowing: { contains: search, mode: 'insensitive' },
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

  /** Find one Animals to the database. */
  async findOneBy(selections: GetOneFarrowingsSelections) {
    const { farrowingId } = selections;
    const farrowing = await this.client.farrowing.findUnique({
      select: FarrowingSelect,
      where: {
        id: farrowingId,
      },
    });

    return farrowing;
  }

  /** Create one Animals to the database. */
  async createOne(options: CreateFarrowingsOptions): Promise<Farrowing> {
    const {
      note,
      litter,
      organizationId,
      userCreatedId,
      checkPregnancyId,
      animalId,
    } = options;

    const farrowing = this.client.farrowing.create({
      data: {
        note,
        litter,
        organizationId,
        userCreatedId,
        checkPregnancyId,
        animalId,
      },
    });

    return farrowing;
  }

  /** Update one Animals to the database. */
  async updateOne(
    selections: UpdateFarrowingsSelections,
    options: UpdateFarrowingsOptions,
  ): Promise<Farrowing> {
    const { farrowingId } = selections;
    const {
      note,
      litter,
      organizationId,
      userCreatedId,
      checkPregnancyId,
      animalId,
      deletedAt,
    } = options;

    const farrowing = this.client.farrowing.update({
      where: {
        id: farrowingId,
      },
      data: {
        note,
        litter,
        organizationId,
        userCreatedId,
        checkPregnancyId,
        animalId,
        deletedAt,
      },
    });

    return farrowing;
  }
}
