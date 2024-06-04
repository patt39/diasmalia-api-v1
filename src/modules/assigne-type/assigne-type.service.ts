import { Injectable } from '@nestjs/common';
import { AssignType, Prisma } from '@prisma/client';
import { DatabaseService } from '../../app/database/database.service';
import {
  WithPaginationResponse,
  withPagination,
} from '../../app/utils/pagination';
import {
  AllAssignedTypeSelect,
  CreateAssignTypesOptions,
  GetAssignTypesSelections,
  GetOneAssignTypeSelections,
  UpdateAssignTypesOptions,
  UpdateAssignTypesSelections,
} from './assigne-type.type';

@Injectable()
export class AssignTypesService {
  constructor(private readonly client: DatabaseService) {}

  async findAll(
    selections: GetAssignTypesSelections,
  ): Promise<WithPaginationResponse | null> {
    const prismaWhereAssignTypes = {} as Prisma.AssignTypeWhereInput;
    const { search, animalTypeId, userId, organizationId, pagination } =
      selections;

    if (search) {
      Object.assign(prismaWhereAssignTypes, {
        OR: [{ contributor: { contains: search, mode: 'insensitive' } }],
      });
    }

    if (organizationId) {
      Object.assign(prismaWhereAssignTypes, { organizationId });
    }

    if (animalTypeId) {
      Object.assign(prismaWhereAssignTypes, { animalTypeId });
    }

    if (userId) {
      Object.assign(prismaWhereAssignTypes, { userId });
    }

    const assignType = await this.client.assignType.findMany({
      where: { ...prismaWhereAssignTypes, deletedAt: null },
      take: pagination.take,
      skip: pagination.skip,
      select: AllAssignedTypeSelect,
      orderBy: pagination.orderBy,
    });

    const rowCount = await this.client.assignType.count({
      where: { ...prismaWhereAssignTypes, deletedAt: null },
    });

    return withPagination({
      pagination,
      rowCount,
      value: assignType,
    });
  }

  /** Find one assignedType in database. */
  async findOneBy(selections: GetOneAssignTypeSelections) {
    const prismaWhere = {} as Prisma.AssignTypeWhereInput;

    const { status, assignTypeId, animalTypeId, organizationId } = selections;

    if (assignTypeId) {
      Object.assign(prismaWhere, { id: assignTypeId });
    }
    if (organizationId) {
      Object.assign(prismaWhere, { organizationId });
    }

    if (animalTypeId) {
      Object.assign(prismaWhere, { animalTypeId });
    }

    if (status) {
      Object.assign(prismaWhere, { status });
    }

    const assignType = await this.client.assignType.findFirst({
      where: { ...prismaWhere, deletedAt: null },
      select: AllAssignedTypeSelect,
    });

    return assignType;
  }

  /** Create one assignedType in database. */
  async createOne(options: CreateAssignTypesOptions): Promise<AssignType> {
    const { animalTypeId, userId, organizationId, userCreatedId } = options;

    const assignTask = this.client.assignType.create({
      data: {
        userId,
        animalTypeId,
        organizationId,
        userCreatedId,
      },
    });

    return assignTask;
  }

  /** Update one assignedType in database. */
  async updateOne(
    selections: UpdateAssignTypesSelections,
    options: UpdateAssignTypesOptions,
  ): Promise<AssignType> {
    const { assignTypeId } = selections;
    const { animalTypeId, userId, deletedAt } = options;

    const assignType = this.client.assignType.update({
      where: { id: assignTypeId },
      data: {
        userId,
        animalTypeId,
        deletedAt,
      },
    });

    return assignType;
  }
}
