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
    const { search, animalTypeId, result, organizationId, pagination } =
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

    const { checkPregnancyId, animalTypeId, organizationId, result, animalId } =
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

    if (animalTypeId) {
      Object.assign(prismaWhere, { animalTypeId });
    }

    if (animalId) {
      Object.assign(prismaWhere, { animalId });
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
    const { result, animalId, animalTypeId, organizationId, userCreatedId } =
      options;

    const checkPregnancy = this.client.checkPregnancy.create({
      data: {
        result,
        animalId,
        animalTypeId,
        organizationId,
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
    const { result, deletedAt } = options;

    const checkPregnancy = this.client.checkPregnancy.update({
      where: { id: checkPregnancyId },
      data: {
        result,
        deletedAt,
      },
    });

    return checkPregnancy;
  }
}
