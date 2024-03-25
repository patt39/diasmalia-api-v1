import { Injectable } from '@nestjs/common';
import { Gestation, Prisma } from '@prisma/client';
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
    const { search, organizationId, pagination } = selections;

    if (search) {
      Object.assign(prismaWhere, {
        OR: [
          {
            code: { contains: search, mode: 'insensitive' },
          },
        ],
      });
    }

    if (organizationId) {
      Object.assign(prismaWhere, { organizationId });
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
    const { gestationId } = selections;
    const gestation = await this.client.gestation.findUnique({
      select: GestationSelect,
      where: {
        id: gestationId,
      },
    });

    return gestation;
  }

  /** Create one Gestation in database. */
  async createOne(options: CreateGestationsOptions): Promise<Gestation> {
    const { animalId, organizationId, userCreatedId, checkPregnancyId, note } =
      options;

    const gestation = this.client.gestation.create({
      data: {
        note,
        animalId,
        organizationId,
        checkPregnancyId,
        userCreatedId,
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
    const {
      note,
      animalId,
      organizationId,
      userCreatedId,
      checkPregnancyId,
      deletedAt,
    } = options;

    const gestation = this.client.gestation.update({
      where: {
        id: gestationId,
      },
      data: {
        note,
        animalId,
        organizationId,
        userCreatedId,
        checkPregnancyId,
        deletedAt,
      },
    });

    return gestation;
  }
}
