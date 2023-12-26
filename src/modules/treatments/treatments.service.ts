import { Injectable } from '@nestjs/common';
import {
  CreateTreatmentsOptions,
  GetTreatmentsSelections,
  GetOneTreatmentsSelections,
  UpdateTreatmentsOptions,
  UpdateTreatmentsSelections,
  TreatmentSelect,
} from './treatments.type';
import { DatabaseService } from '../../app/database/database.service';
import {
  WithPaginationResponse,
  withPagination,
} from '../../app/utils/pagination';
import { Treatment, Prisma } from '@prisma/client';

@Injectable()
export class TreatmentsService {
  constructor(private readonly client: DatabaseService) {}

  async findAll(
    selections: GetTreatmentsSelections,
  ): Promise<WithPaginationResponse | null> {
    const prismaWhereTreatment = {} as Prisma.TreatmentWhereInput;
    const { search, organizationId, pagination } = selections;

    if (search) {
      Object.assign(prismaWhereTreatment, {
        OR: [
          {
            numberOfDose: { contains: search, mode: 'insensitive' },
          },
        ],
      });
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

  /** Find one Treatments to the database. */
  async findOneBy(selections: GetOneTreatmentsSelections) {
    const { treatmentId } = selections;
    const treatment = await this.client.treatment.findUnique({
      select: TreatmentSelect,
      where: {
        id: treatmentId,
      },
    });

    return treatment;
  }

  /** Create one Treatments to the database. */
  async createOne(options: CreateTreatmentsOptions): Promise<Treatment> {
    const {
      numberOfDose,
      treatmentName,
      treatmentDate,
      medicationId,
      note,
      diagnosisId,
      animalId,
      organizationId,
      userCreatedId,
    } = options;

    const treatment = this.client.treatment.create({
      data: {
        numberOfDose,
        treatmentName,
        treatmentDate,
        medicationId,
        note,
        diagnosisId,
        animalId,
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
      numberOfDose,
      treatmentName,
      treatmentDate,
      medicationId,
      note,
      diagnosisId,
      animalId,
      deletedAt,
    } = options;

    const treatment = this.client.treatment.update({
      where: {
        id: treatmentId,
      },
      data: {
        numberOfDose,
        treatmentName,
        treatmentDate,
        medicationId,
        note,
        diagnosisId,
        animalId,
        deletedAt,
      },
    });

    return treatment;
  }
}
