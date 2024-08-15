import { Injectable } from '@nestjs/common';
import { Gestation, Prisma } from '@prisma/client';
import {
  dateTimeNowUtc,
  substrateDaysToTimeNowUtcDate,
} from 'src/app/utils/commons';
import { DatabaseService } from '../../app/database/database.service';
import {
  WithPaginationResponse,
  withPagination,
} from '../../app/utils/pagination';
import {
  CreateGestationsOptions,
  GestationSelect,
  GetGestationsSelections,
  GetOneGestationSelections,
  UpdateGestationsOptions,
  UpdateGestationsSelections,
} from './gestations.type';

@Injectable()
export class GestationsService {
  constructor(private readonly client: DatabaseService) {}

  async findAll(
    selections: GetGestationsSelections,
  ): Promise<WithPaginationResponse | null> {
    const prismaWhere = {} as Prisma.GestationWhereInput;
    const { search, periode, animalTypeId, organizationId, pagination } =
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

    if (periode) {
      Object.assign(prismaWhere, {
        createdAt: {
          gte: substrateDaysToTimeNowUtcDate(Number(periode)),
          lte: dateTimeNowUtc(),
        },
      });
    }

    const gestations = await this.client.gestation.findMany({
      where: { ...prismaWhere, deletedAt: null },
      take: pagination.take,
      skip: pagination.skip,
      select: GestationSelect,
      orderBy: pagination.orderBy,
    });

    const rowCount = await this.client.gestation.count({
      where: { ...prismaWhere, deletedAt: null },
    });

    return withPagination({
      pagination,
      rowCount,
      value: gestations,
    });
  }

  /** Find one Gestation in database. */
  async findOneBy(selections: GetOneGestationSelections) {
    const prismaWhere = {} as Prisma.GestationWhereInput;
    const { gestationId, animalId, animalTypeId, checkPregnancyId } =
      selections;

    if (gestationId) {
      Object.assign(prismaWhere, { id: gestationId });
    }

    if (animalId) {
      Object.assign(prismaWhere, { animalId });
    }

    if (animalTypeId) {
      Object.assign(prismaWhere, { animalTypeId });
    }

    if (checkPregnancyId) {
      Object.assign(prismaWhere, { checkPregnancyId });
    }

    const gestation = await this.client.gestation.findFirst({
      where: { ...prismaWhere, deletedAt: null },
      select: GestationSelect,
    });

    return gestation;
  }

  /** Create one Gestation in database. */
  async createOne(options: CreateGestationsOptions): Promise<Gestation> {
    const {
      note,
      method,
      animalId,
      breedingId,
      farrowingDate,
      organizationId,
      checkPregnancyId,
      userCreatedId,
      animalTypeId,
    } = options;

    const gestation = this.client.gestation.create({
      data: {
        note,
        method,
        animalId,
        breedingId,
        farrowingDate,
        organizationId,
        checkPregnancyId,
        userCreatedId,
        animalTypeId,
      },
    });

    return gestation;
  }

  /** Update one Gestation in database. */
  async updateOne(
    selections: UpdateGestationsSelections,
    options: UpdateGestationsOptions,
  ): Promise<Gestation> {
    const { gestationId } = selections;
    const { note, method, farrowingDate, userCreatedId, deletedAt } = options;

    const gestation = this.client.gestation.update({
      where: { id: gestationId },
      data: {
        note,
        method,
        farrowingDate,
        userCreatedId,
        deletedAt,
      },
    });

    return gestation;
  }
}
