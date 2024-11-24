import { Injectable } from '@nestjs/common';
import { Building, Prisma } from '@prisma/client';
import { DatabaseService } from '../../app/database/database.service';
import {
  WithPaginationResponse,
  withPagination,
} from '../../app/utils/pagination';
import {
  BuildingsSelect,
  CreateBuildingsOptions,
  GetBuildingsSelections,
  GetOneBuildingsSelections,
  UpdateBuildingsOptions,
  UpdateBuildingsSelections,
} from './buildings.type';

@Injectable()
export class BuildingsService {
  constructor(private readonly client: DatabaseService) {}

  async findAll(
    selections: GetBuildingsSelections,
  ): Promise<WithPaginationResponse | null> {
    const prismaWhere = {} as Prisma.BuildingWhereInput;
    const {
      search,
      animalTypeId,
      productionPhase,
      pagination,
      organizationId,
    } = selections;

    if (search) {
      Object.assign(prismaWhere, {
        OR: [{ code: { contains: search, mode: 'insensitive' } }],
      });
    }

    if (animalTypeId) {
      Object.assign(prismaWhere, { animalTypeId });
    }

    if (productionPhase) {
      Object.assign(prismaWhere, { productionPhase });
    }

    if (organizationId) {
      Object.assign(prismaWhere, { organizationId });
    }

    const buildings = await this.client.building.findMany({
      where: { ...prismaWhere, deletedAt: null },
      take: pagination.take,
      skip: pagination.skip,
      select: BuildingsSelect,
      orderBy: pagination.orderBy,
    });

    const rowCount = await this.client.building.count({
      where: { ...prismaWhere, deletedAt: null },
    });

    return withPagination({
      pagination,
      rowCount,
      value: buildings,
    });
  }

  /** Find one building in database. */
  async findOneByCode(selections: GetOneBuildingsSelections) {
    const { code } = selections;

    const building = await this.client.building.findFirst({
      select: BuildingsSelect,
      where: {
        code: code,
      },
    });

    return building;
  }

  /** Find one building in database. */
  async findOneBy(selections: GetOneBuildingsSelections) {
    const prismaWhere = {} as Prisma.BuildingWhereInput;

    const { buildingId, code, animalTypeId, productionPhase, organizationId } =
      selections;

    if (buildingId) {
      Object.assign(prismaWhere, { id: buildingId });
    }

    if (organizationId) {
      Object.assign(prismaWhere, { organizationId });
    }

    if (animalTypeId) {
      Object.assign(prismaWhere, { animalTypeId });
    }

    if (code) {
      Object.assign(prismaWhere, { code });
    }

    if (productionPhase) {
      Object.assign(prismaWhere, { productionPhase });
    }

    const building = await this.client.building.findFirst({
      where: { ...prismaWhere, deletedAt: null },
      select: BuildingsSelect,
    });

    return building;
  }

  /** Create one building in database. */
  async createOne(options: CreateBuildingsOptions): Promise<Building> {
    const {
      code,
      squareMeter,
      animalTypeId,
      productionPhase,
      organizationId,
      userCreatedId,
    } = options;

    const building = this.client.building.create({
      data: {
        code,
        squareMeter,
        animalTypeId,
        productionPhase,
        organizationId,
        userCreatedId,
      },
    });

    return building;
  }

  /** Update one building in database. */
  async updateOne(
    selections: UpdateBuildingsSelections,
    options: UpdateBuildingsOptions,
  ): Promise<Building> {
    const { buildingId } = selections;
    const { code, squareMeter, productionPhase, deletedAt } = options;

    const building = this.client.building.update({
      where: { id: buildingId },
      data: {
        code,
        squareMeter,
        productionPhase,
        deletedAt,
      },
    });

    return building;
  }
}
