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
    const { search, organizationId, animalTypeId, pagination } = selections;

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
    const { farrowingId, animalTypeId } = selections;

    if (farrowingId) {
      Object.assign(prismaWhere, { id: farrowingId });
    }

    if (animalTypeId) {
      Object.assign(prismaWhere, { animalTypeId });
    }

    const farrowing = await this.client.farrowing.findFirst({
      where: { ...prismaWhere, deletedAt: null },
      select: FarrowingSelect,
    });

    return farrowing;
  }

  /** Create one farrowing in database. */
  async createOne(options: CreateFarrowingsOptions): Promise<Farrowing> {
    const {
      note,
      date,
      litter,
      animalId,
      animalTypeId,
      userCreatedId,
      organizationId,
    } = options;

    const farrowing = this.client.farrowing.create({
      data: {
        note,
        date,
        litter,
        animalId,
        animalTypeId,
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
      animalTypeId,
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
        animalTypeId,
        organizationId,
        userCreatedId,
        deletedAt,
      },
    });

    return farrowing;
  }
}
