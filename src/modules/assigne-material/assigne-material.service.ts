import { Injectable } from '@nestjs/common';
import { AssignMaterial, Prisma } from '@prisma/client';
import { DatabaseService } from '../../app/database/database.service';
import {
  withPagination,
  WithPaginationResponse,
} from '../../app/utils/pagination';
import {
  AllAssignedMaterialsSelect,
  CreateAssignMaterialsOptions,
  GetAssignMaterialsSelections,
  GetOneAssignMaterialSelections,
  UpdateAssignMaterialOptions,
  UpdateAssignMaterialSelections,
} from './assigne-material.type';

@Injectable()
export class AssignMaterialsService {
  constructor(private readonly client: DatabaseService) {}

  async findAll(
    selections: GetAssignMaterialsSelections,
  ): Promise<WithPaginationResponse | null> {
    const prismaWhereAssignTypes = {} as Prisma.AssignMaterialWhereInput;
    const {
      type,
      locationId,
      materialId,
      organizationId,
      pagination,
      buildingId,
    } = selections;

    if (organizationId) {
      Object.assign(prismaWhereAssignTypes, { organizationId });
    }

    if (locationId) {
      Object.assign(prismaWhereAssignTypes, { locationId });
    }

    if (buildingId) {
      Object.assign(prismaWhereAssignTypes, { buildingId });
    }

    if (materialId) {
      Object.assign(prismaWhereAssignTypes, { materialId });
    }

    if (type) {
      Object.assign(prismaWhereAssignTypes, { type });
    }

    const assignMaterial = await this.client.assignMaterial.findMany({
      where: { ...prismaWhereAssignTypes, deletedAt: null },
      take: pagination.take,
      skip: pagination.skip,
      select: AllAssignedMaterialsSelect,
      orderBy: pagination.orderBy,
    });

    const rowCount = await this.client.assignMaterial.count({
      where: { ...prismaWhereAssignTypes, deletedAt: null },
    });

    return withPagination({
      pagination,
      rowCount,
      value: assignMaterial,
    });
  }

  /** Find one assignedMaterial in database. */
  async findOneBy(selections: GetOneAssignMaterialSelections) {
    const prismaWhere = {} as Prisma.AssignMaterialWhereInput;

    const {
      buildingId,
      materialId,
      assignMaterialId,
      locationId,
      organizationId,
    } = selections;

    if (assignMaterialId) {
      Object.assign(prismaWhere, { id: assignMaterialId });
    }

    if (materialId) {
      Object.assign(prismaWhere, { materialId });
    }

    if (organizationId) {
      Object.assign(prismaWhere, { organizationId });
    }

    if (buildingId) {
      Object.assign(prismaWhere, { buildingId });
    }

    if (locationId) {
      Object.assign(prismaWhere, { locationId });
    }

    const assignMaterial = await this.client.assignMaterial.findFirst({
      where: { ...prismaWhere, deletedAt: null },
      select: AllAssignedMaterialsSelect,
    });

    return assignMaterial;
  }

  /** Create one assignedMaterial in database. */
  async createOne(
    options: CreateAssignMaterialsOptions,
  ): Promise<AssignMaterial> {
    const {
      type,
      status,
      buildingId,
      locationId,
      materialId,
      userCreatedId,
      organizationId,
    } = options;

    const assignMaterial = this.client.assignMaterial.create({
      data: {
        type,
        status,
        buildingId,
        materialId,
        locationId,
        userCreatedId,
        organizationId,
      },
    });

    return assignMaterial;
  }

  /** Update one assignedMaterial in database. */
  async updateOne(
    selections: UpdateAssignMaterialSelections,
    options: UpdateAssignMaterialOptions,
  ): Promise<AssignMaterial> {
    const { assignMaterialId } = selections;
    const { status, deletedAt } = options;

    const assignMaterial = this.client.assignMaterial.update({
      where: { id: assignMaterialId },
      data: {
        status,
        deletedAt,
      },
    });

    return assignMaterial;
  }
}
