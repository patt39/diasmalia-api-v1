import { Injectable } from '@nestjs/common';
import { Prisma, Treatment } from '@prisma/client';
import { DatabaseService } from '../../app/database/database.service';
import {
  dateTimeNowUtc,
  substrateDaysToTimeNowUtcDate,
} from '../../app/utils/commons';
import {
  WithPaginationResponse,
  withPagination,
} from '../../app/utils/pagination';
import {
  CreateTreatmentsOptions,
  GetOneTreatmentsSelections,
  GetTreatmentsSelections,
  TreatmentSelect,
  UpdateTreatmentsOptions,
  UpdateTreatmentsSelections,
} from './treatments.type';

@Injectable()
export class TreatmentsService {
  constructor(private readonly client: DatabaseService) {}

  async findAll(
    selections: GetTreatmentsSelections,
  ): Promise<WithPaginationResponse | null> {
    const prismaWhereTreatment = {} as Prisma.TreatmentWhereInput;
    const {
      search,
      periode,
      animalId,
      animalTypeId,
      organizationId,
      pagination,
    } = selections;

    if (search) {
      Object.assign(prismaWhereTreatment, {
        OR: [{ animal: { code: { contains: search, mode: 'insensitive' } } }],
      });
    }

    if (animalTypeId) {
      Object.assign(prismaWhereTreatment, { animalTypeId });
    }

    if (animalId) {
      Object.assign(prismaWhereTreatment, { animalId });
    }

    if (organizationId) {
      Object.assign(prismaWhereTreatment, { organizationId });
    }

    if (periode) {
      Object.assign(prismaWhereTreatment, {
        createdAt: {
          gte: substrateDaysToTimeNowUtcDate(Number(periode)),
          lte: dateTimeNowUtc(),
        },
      });
    }

    const treatments = await this.client.treatment.findMany({
      where: {
        ...prismaWhereTreatment,
        deletedAt: null,
        animal: {
          status: 'ACTIVE',
          deletedAt: null,
        },
      },
      take: pagination.take,
      skip: pagination.skip,
      select: TreatmentSelect,
      orderBy: pagination.orderBy,
    });

    const rowCount = await this.client.treatment.count({
      where: { ...prismaWhereTreatment, deletedAt: null },
    });

    return withPagination({
      pagination,
      rowCount,
      value: treatments,
    });
  }

  /** Find one treatment in database. */
  async findOneBy(selections: GetOneTreatmentsSelections) {
    const prismaWhereTreatment = {} as Prisma.TreatmentWhereInput;
    const { treatmentId, animalId, animalTypeId, organizationId } = selections;

    if (animalId) {
      Object.assign(prismaWhereTreatment, { animalId });
    }

    if (treatmentId) {
      Object.assign(prismaWhereTreatment, { id: treatmentId });
    }

    if (organizationId) {
      Object.assign(prismaWhereTreatment, { organizationId });
    }

    if (animalTypeId) {
      Object.assign(prismaWhereTreatment, { animalTypeId });
    }

    const treatment = await this.client.treatment.findFirst({
      where: { ...prismaWhereTreatment, deletedAt: null },
      select: TreatmentSelect,
    });

    return treatment;
  }

  /** Create one Treatments to the database. */
  async createOne(options: CreateTreatmentsOptions): Promise<Treatment> {
    const {
      note,
      name,
      dose,
      method,
      diagnosis,
      healthId,
      animalId,
      animalTypeId,
      organizationId,
      userCreatedId,
    } = options;

    const treatment = this.client.treatment.create({
      data: {
        note,
        name,
        dose,
        method,
        animalId,
        diagnosis,
        healthId,
        animalTypeId,
        organizationId,
        userCreatedId,
      },
    });

    return treatment;
  }

  /** Update one Treatments to the database. */
  async updateOne(
    selections: UpdateTreatmentsSelections,
    options: UpdateTreatmentsOptions,
  ): Promise<Treatment> {
    const { treatmentId } = selections;
    const {
      note,
      name,
      dose,
      method,
      diagnosis,
      healthId,
      animalId,
      deletedAt,
    } = options;

    const treatment = this.client.treatment.update({
      where: { id: treatmentId },
      data: {
        note,
        name,
        dose,
        method,
        animalId,
        diagnosis,
        healthId,
        deletedAt,
      },
    });

    return treatment;
  }
}
