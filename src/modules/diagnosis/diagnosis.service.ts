import { Injectable } from '@nestjs/common';
import {
  CreateDiagnosisOptions,
  GetDiagnosisSelections,
  GetOneDiagnosisSelections,
  UpdateDiagnosisOptions,
  UpdateDiagnosisSelections,
  DiagnosisSelect,
} from './diagnosis.type';
import { DatabaseService } from '../../app/database/database.service';
import {
  WithPaginationResponse,
  withPagination,
} from '../../app/utils/pagination';
import { Diagnosis, Prisma } from '@prisma/client';

@Injectable()
export class DiagnosisService {
  constructor(private readonly client: DatabaseService) {}

  async findAll(
    selections: GetDiagnosisSelections,
  ): Promise<WithPaginationResponse | null> {
    const prismaWhere = {} as Prisma.DiagnosisWhereInput;
    const { search, organizationId, pagination } = selections;

    if (search) {
      Object.assign(prismaWhere, {
        OR: [
          {
            name: { contains: search, mode: 'insensitive' },
          },
        ],
      });
    }

    if (organizationId) {
      Object.assign(prismaWhere, { organizationId });
    }

    const diagnosis = await this.client.diagnosis.findMany({
      where: { ...prismaWhere, deletedAt: null },
      take: pagination.take,
      skip: pagination.skip,
      select: DiagnosisSelect,
      orderBy: pagination.orderBy,
    });

    const rowCount = await this.client.diagnosis.count({
      where: { ...prismaWhere, deletedAt: null },
    });

    return withPagination({
      pagination,
      rowCount,
      value: diagnosis,
    });
  }

  /** Find one Diagnosis to the database. */
  async findOneBy(selections: GetOneDiagnosisSelections) {
    const { diagnosisId } = selections;
    const diagnosis = await this.client.diagnosis.findUnique({
      select: DiagnosisSelect,
      where: {
        id: diagnosisId,
      },
    });

    return diagnosis;
  }

  /** Create one Diagnosis to the database. */
  async createOne(options: CreateDiagnosisOptions): Promise<Diagnosis> {
    const { name, organizationId, userCreatedId } = options;

    const diagnosis = this.client.diagnosis.create({
      data: {
        name,
        organizationId,
        userCreatedId,
      },
    });

    return diagnosis;
  }

  /** Update one Diagnosis to the database. */
  async updateOne(
    selections: UpdateDiagnosisSelections,
    options: UpdateDiagnosisOptions,
  ): Promise<Diagnosis> {
    const { diagnosisId } = selections;
    const { name, deletedAt } = options;

    const diagnosis = this.client.diagnosis.update({
      where: {
        id: diagnosisId,
      },
      data: {
        name,
        deletedAt,
      },
    });

    return diagnosis;
  }
}
