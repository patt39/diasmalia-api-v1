import { Injectable } from '@nestjs/common';
import { Health, Prisma } from '@prisma/client';
import { DatabaseService } from '../../app/database/database.service';
import {
  withPagination,
  WithPaginationResponse,
} from '../../app/utils/pagination';
import {
  CreateHealthsOptions,
  GetHealthSelections,
  GetOneHealthSelections,
  HealthSelect,
  UpdateHealthSelections,
  UpdateHealthsOptions,
} from './health.type';

@Injectable()
export class HealthsService {
  constructor(private readonly client: DatabaseService) {}

  async findAll(
    selections: GetHealthSelections,
  ): Promise<WithPaginationResponse | null> {
    const prismaWhere = {} as Prisma.HealthWhereInput;
    const { organizationId, category, animalTypeId, status, pagination } =
      selections;

    if (organizationId) {
      Object.assign(prismaWhere, { organizationId });
    }

    if (status) {
      status === 'true'
        ? Object.assign(prismaWhere, { status: true })
        : Object.assign(prismaWhere, { status: false });
    }

    if (category) {
      Object.assign(prismaWhere, { category });
    }

    if (animalTypeId) {
      Object.assign(prismaWhere, { animalTypeId });
    }

    const health = await this.client.health.findMany({
      where: { ...prismaWhere, deletedAt: null },
      take: pagination.take,
      skip: pagination.skip,
      select: HealthSelect,
      orderBy: pagination.orderBy,
    });

    const rowCount = await this.client.health.count({
      where: { ...prismaWhere, deletedAt: null },
    });

    return withPagination({
      pagination,
      rowCount,
      value: health,
    });
  }

  /** Find one health in database. */
  async findOneBy(selections: GetOneHealthSelections) {
    const prismaWhere = {} as Prisma.HealthWhereInput;
    const { healthId, name, animalTypeId, status, organizationId } = selections;

    if (healthId) {
      Object.assign(prismaWhere, { id: healthId });
    }

    if (status) {
      status === 'true'
        ? Object.assign(prismaWhere, { status: true })
        : Object.assign(prismaWhere, { status: false });
    }

    if (organizationId) {
      Object.assign(prismaWhere, { organizationId });
    }

    if (name) {
      Object.assign(prismaWhere, { name });
    }

    if (animalTypeId) {
      Object.assign(prismaWhere, { animalTypeId });
    }

    const health = await this.client.health.findFirst({
      where: { ...prismaWhere, deletedAt: null },
      select: HealthSelect,
    });

    return health;
  }

  /** Create one health in database. */
  async createOne(options: CreateHealthsOptions): Promise<Health> {
    const {
      name,
      status,
      category,
      animalTypeId,
      organizationId,
      userCreatedId,
    } = options;

    const health = this.client.health.create({
      data: {
        name,
        status,
        category,
        animalTypeId,
        organizationId,
        userCreatedId,
      },
    });

    return health;
  }

  /** Update one health in database. */
  async updateOne(
    selections: UpdateHealthSelections,
    options: UpdateHealthsOptions,
  ): Promise<Health> {
    const { healthId } = selections;
    const { name, status, category, userCreatedId, animalTypeId, deletedAt } =
      options;

    const health = this.client.health.update({
      where: { id: healthId },
      data: {
        name,
        status,
        category,
        animalTypeId,
        userCreatedId,
        deletedAt,
      },
    });

    return health;
  }
}
