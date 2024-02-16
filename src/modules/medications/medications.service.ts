import { Injectable } from '@nestjs/common';
import {
  CreateMedicationsOptions,
  GetMedicationsSelections,
  GetOneMedicationsSelections,
  UpdateMedicationsOptions,
  UpdateMedicationsSelections,
  MedicationSelect,
} from './medications.type';
import { DatabaseService } from '../../app/database/database.service';
import {
  WithPaginationResponse,
  withPagination,
} from '../../app/utils/pagination';
import { Medication, Prisma } from '@prisma/client';

@Injectable()
export class MedicationsService {
  constructor(private readonly client: DatabaseService) {}

  async findAll(
    selections: GetMedicationsSelections,
  ): Promise<WithPaginationResponse | null> {
    const prismaWhereMedication = {} as Prisma.MedicationWhereInput;
    const { search, organizationId, pagination } = selections;

    if (search) {
      Object.assign(prismaWhereMedication, {
        OR: [
          {
            name: { contains: search, mode: 'insensitive' },
          },
        ],
      });
    }

    if (organizationId) {
      Object.assign(prismaWhereMedication, { organizationId });
    }

    const medications = await this.client.medication.findMany({
      where: { ...prismaWhereMedication, deletedAt: null },
      take: pagination.take,
      skip: pagination.skip,
      select: MedicationSelect,
      orderBy: pagination.orderBy,
    });

    const rowCount = await this.client.medication.count({
      where: { ...prismaWhereMedication, deletedAt: null },
    });

    return withPagination({
      pagination,
      rowCount,
      value: medications,
    });
  }

  /** Find one medication in database. */
  async findOneBy(selections: GetOneMedicationsSelections) {
    const prismaWhereMedication = {} as Prisma.MedicationWhereInput;
    const { name, medicationId, organizationId } = selections;

    if (medicationId) {
      Object.assign(prismaWhereMedication, { id: medicationId });
    }

    if (organizationId) {
      Object.assign(prismaWhereMedication, { organizationId });
    }

    if (name) {
      Object.assign(prismaWhereMedication, { name });
    }

    const medication = await this.client.medication.findFirst({
      where: { ...prismaWhereMedication, deletedAt: null },
      select: MedicationSelect,
    });

    return medication;
  }

  /** Create one medications in database. */
  async createOne(options: CreateMedicationsOptions): Promise<Medication> {
    const { name, organizationId, userCreatedId } = options;

    const medication = this.client.medication.create({
      data: {
        name,
        organizationId,
        userCreatedId,
      },
    });

    return medication;
  }

  /** Update one medication in database. */
  async updateOne(
    selections: UpdateMedicationsSelections,
    options: UpdateMedicationsOptions,
  ): Promise<Medication> {
    const { medicationId } = selections;
    const { name, deletedAt } = options;

    const medication = this.client.medication.update({
      where: {
        id: medicationId,
      },
      data: {
        name,
        deletedAt,
      },
    });

    return medication;
  }
}
