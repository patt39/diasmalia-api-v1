import { Injectable } from '@nestjs/common';
import { CheckPregnancy, Prisma } from '@prisma/client';
import { DatabaseService } from '../../app/database/database.service';
import {
  WithPaginationResponse,
  withPagination,
} from '../../app/utils/pagination';
import {
  CheckPregnancySelect,
  CreateCheckPregnanciesOptions,
  GetCheckPregnanciesSelections,
  GetOneCheckPregnanciesSelections,
  UpdateCheckPregnanciesOptions,
  UpdateCheckPregnanciesSelections,
} from './check-pregnancies.type';

@Injectable()
export class CheckPregnanciesService {
  constructor(private readonly client: DatabaseService) {}

  async findAll(
    selections: GetCheckPregnanciesSelections,
  ): Promise<WithPaginationResponse | null> {
    const prismaWhere = {} as Prisma.CheckPregnancyWhereInput;
    const { search, method, result, organizationId, pagination } = selections;

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

    if (method) {
      Object.assign(prismaWhere, { method });
    }

    if (result) {
      Object.assign(prismaWhere, { result });
    }

    const checkPregnancies = await this.client.checkPregnancy.findMany({
      where: { ...prismaWhere, deletedAt: null },
      take: pagination.take,
      skip: pagination.skip,
      select: CheckPregnancySelect,
      orderBy: pagination.orderBy,
    });

    const rowCount = await this.client.checkPregnancy.count({
      where: { ...prismaWhere, deletedAt: null },
    });

    return withPagination({
      pagination,
      rowCount,
      value: checkPregnancies,
    });
  }

  /** Find one CheckPregnancy in database. */
  async findOneBy(selections: GetOneCheckPregnanciesSelections) {
    const prismaWhere = {} as Prisma.CheckPregnancyWhereInput;

    const { checkPregnancyId, farrowingDate, organizationId, result } =
      selections;

    if (checkPregnancyId) {
      Object.assign(prismaWhere, { id: checkPregnancyId });
    }

    if (organizationId) {
      Object.assign(prismaWhere, { organizationId });
    }

    if (result) {
      Object.assign(prismaWhere, { result });
    }

    if (farrowingDate) {
      Object.assign(prismaWhere, { farrowingDate });
    }

    const checkPregnancy = await this.client.checkPregnancy.findFirst({
      where: { ...prismaWhere, deletedAt: null },
    });

    return checkPregnancy;
  }

  /** Create one CheckPregnancy in database. */
  async createOne(
    options: CreateCheckPregnanciesOptions,
  ): Promise<CheckPregnancy> {
    const {
      date,
      note,
      farrowingDate,
      method,
      result,
      animalFemaleId,
      organizationId,
      breedingId,
      userCreatedId,
    } = options;

    const checkPregnancy = this.client.checkPregnancy.create({
      data: {
        date,
        note,
        farrowingDate,
        method,
        result,
        animalFemaleId,
        organizationId,
        breedingId,
        userCreatedId,
      },
    });

    return checkPregnancy;
  }

  /** Update one CheckPregnancy in database. */
  async updateOne(
    selections: UpdateCheckPregnanciesSelections,
    options: UpdateCheckPregnanciesOptions,
  ): Promise<CheckPregnancy> {
    const { checkPregnancyId } = selections;
    const { date, note, farrowingDate, method, result, breedingId, deletedAt } =
      options;

    const checkPregnancy = this.client.checkPregnancy.update({
      where: {
        id: checkPregnancyId,
      },
      data: {
        date,
        note,
        farrowingDate,
        method,
        result,
        breedingId,
        deletedAt,
      },
    });

    return checkPregnancy;
  }
}
