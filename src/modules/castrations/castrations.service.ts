import { Injectable } from '@nestjs/common';
import { Castration, Prisma } from '@prisma/client';
import { DatabaseService } from '../../app/database/database.service';
import {
  WithPaginationResponse,
  withPagination,
} from '../../app/utils/pagination';
import {
  CreateCastrationsOptions,
  GetCastrationsSelections,
  GetOneCastrationsSelections,
  UpdateCastrationsOptions,
  UpdateCastrationsSelections,
  castrationsSelect,
} from './castrations.type';

@Injectable()
export class CastrationsService {
  constructor(private readonly client: DatabaseService) {}

  async findAll(
    selections: GetCastrationsSelections,
  ): Promise<WithPaginationResponse | null> {
    const prismaWhere = {} as Prisma.CastrationWhereInput;
    const { search, method, animalTypeId, pagination } = selections;

    if (search) {
      Object.assign(prismaWhere, {
        OR: [{ animal: { code: { contains: search, mode: 'insensitive' } } }],
      });
    }

    if (method) {
      Object.assign(prismaWhere, { method });
    }

    if (animalTypeId) {
      Object.assign(prismaWhere, { animalTypeId });
    }

    const castrations = await this.client.castration.findMany({
      where: { ...prismaWhere, deletedAt: null },
      take: pagination.take,
      skip: pagination.skip,
      select: castrationsSelect,
      orderBy: pagination.orderBy,
    });

    const rowCount = await this.client.castration.count({
      where: { ...prismaWhere, deletedAt: null },
    });

    return withPagination({
      pagination,
      rowCount,
      value: castrations,
    });
  }

  /** Find one castration in database. */
  async findOneBy(selections: GetOneCastrationsSelections) {
    const prismaWhere = {} as Prisma.CastrationWhereInput;

    const { castrationId, animalTypeId, organizationId } = selections;

    if (castrationId) {
      Object.assign(prismaWhere, { id: castrationId });
    }

    if (organizationId) {
      Object.assign(prismaWhere, { organizationId });
    }

    if (animalTypeId) {
      Object.assign(prismaWhere, { animalTypeId });
    }

    const castration = await this.client.castration.findFirst({
      where: { ...prismaWhere, deletedAt: null },
    });

    return castration;
  }

  /** Create one castration in database. */
  async createOne(options: CreateCastrationsOptions): Promise<Castration> {
    const {
      note,
      date,
      method,
      animalId,
      animalTypeId,
      organizationId,
      userCreatedId,
    } = options;

    const castration = this.client.castration.create({
      data: {
        date,
        note,
        method,
        animalId,
        animalTypeId,
        organizationId,
        userCreatedId,
      },
    });

    return castration;
  }

  /** Update one castration in database. */
  async updateOne(
    selections: UpdateCastrationsSelections,
    options: UpdateCastrationsOptions,
  ): Promise<Castration> {
    const { castrationId } = selections;
    const { date, note, method, animalId, deletedAt } = options;

    const castration = this.client.castration.update({
      where: {
        id: castrationId,
      },
      data: {
        date,
        note,
        method,
        animalId,
        deletedAt,
      },
    });

    return castration;
  }
}
