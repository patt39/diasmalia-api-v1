import { Injectable } from '@nestjs/common';
import { Prisma, Treatment } from '@prisma/client';
import { Slug, generateNumber } from 'src/app/utils/commons';
import { DatabaseService } from '../../app/database/database.service';
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
    const { search, animalTypeId, organizationId, pagination } = selections;

    if (search) {
      Object.assign(prismaWhereTreatment, {
        OR: [{ animal: { code: { contains: search, mode: 'insensitive' } } }],
      });
    }

    if (animalTypeId) {
      Object.assign(prismaWhereTreatment, { animalTypeId });
    }

    if (organizationId) {
      Object.assign(prismaWhereTreatment, { organizationId });
    }

    const treatments = await this.client.treatment.findMany({
      where: { ...prismaWhereTreatment, deletedAt: null },
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
    const { treatmentId, animalTypeId, organizationId } = selections;

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
      date,
      method,
      diagnosis,
      medication,
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
        date,
        slug: `${Slug(name)}-${generateNumber(4)}`,
        method,
        animalId,
        diagnosis,
        medication,
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
    const { note, name, dose, date, method, animalId, diagnosis, deletedAt } =
      options;

    const treatment = this.client.treatment.update({
      where: {
        id: treatmentId,
      },
      data: {
        note,
        name,
        dose,
        date,
        method,
        animalId,
        diagnosis,
        deletedAt,
      },
    });

    return treatment;
  }
}
