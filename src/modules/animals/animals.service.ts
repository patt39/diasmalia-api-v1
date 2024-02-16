import { Injectable } from '@nestjs/common';
import { Animal, Prisma } from '@prisma/client';
import { DatabaseService } from '../../app/database/database.service';
import {
  WithPaginationResponse,
  withPagination,
} from '../../app/utils/pagination';
import {
  AnimalSelect,
  CreateAnimalsOptions,
  GetAnimalsSelections,
  GetOneAnimalsSelections,
  UpdateAnimalsOptions,
  UpdateAnimalsSelections,
} from './animals.type';

@Injectable()
export class AnimalsService {
  constructor(private readonly client: DatabaseService) {}

  async findAll(
    selections: GetAnimalsSelections,
  ): Promise<WithPaginationResponse | null> {
    const prismaWhere = {} as Prisma.AnimalWhereInput;
    const {
      type,
      search,
      status,
      gender,
      productionPhase,
      organizationId,
      pagination,
      animalIds,
    } = selections;

    if (search) {
      Object.assign(prismaWhere, {
        OR: [
          {
            code: { contains: search, mode: 'insensitive' },
          },
          {
            codeFather: { contains: search, mode: 'insensitive' },
          },
          {
            electronicCode: { contains: search, mode: 'insensitive' },
          },
          {
            codeMother: { contains: search, mode: 'insensitive' },
          },
        ],
      });
    }

    if (animalIds) {
      Object.assign(prismaWhere, { id: { in: animalIds } });
    }

    if (organizationId) {
      Object.assign(prismaWhere, { organizationId });
    }

    if (status) {
      Object.assign(prismaWhere, { status });
    }

    if (type) {
      Object.assign(prismaWhere, { type });
    }

    if (gender) {
      Object.assign(prismaWhere, { gender });
    }

    if (productionPhase) {
      Object.assign(prismaWhere, { productionPhase });
    }

    const animals = await this.client.animal.findMany({
      where: { ...prismaWhere, deletedAt: null },
      take: pagination.take,
      skip: pagination.skip,
      select: AnimalSelect,
      orderBy: pagination.orderBy,
    });

    const rowCount = await this.client.animal.count({
      where: { ...prismaWhere, deletedAt: null },
    });

    return withPagination({
      pagination,
      rowCount,
      value: animals,
    });
  }

  /** Find one Animal in database. */
  async findOneBy(selections: GetOneAnimalsSelections) {
    const prismaWhere = {} as Prisma.AnimalWhereInput;
    const {
      code,
      type,
      gender,
      status,
      animalId,
      organizationId,
      electronicCode,
      productionPhase,
    } = selections;

    if (animalId) {
      Object.assign(prismaWhere, { id: animalId });
    }

    if (gender) {
      Object.assign(prismaWhere, { gender });
    }

    if (electronicCode) {
      Object.assign(prismaWhere, { electronicCode });
    }

    if (type) {
      Object.assign(prismaWhere, { type });
    }

    if (code) {
      Object.assign(prismaWhere, { code });
    }

    if (status) {
      Object.assign(prismaWhere, { status });
    }

    if (productionPhase) {
      Object.assign(prismaWhere, { productionPhase });
    }

    if (organizationId) {
      Object.assign(prismaWhere, { organizationId });
    }

    const animal = await this.client.animal.findFirst({
      where: { ...prismaWhere, deletedAt: null },
      select: AnimalSelect,
    });

    return animal;
  }

  /** Create one Animal in database. */
  async createOne(options: CreateAnimalsOptions): Promise<Animal> {
    const {
      code,
      type,
      status,
      weight,
      gender,
      birthday,
      breedId,
      locationId,
      codeFather,
      codeMother,
      productionPhase,
      electronicCode,
      organizationId,
      userCreatedId,
    } = options;

    const animal = this.client.animal.create({
      data: {
        code,
        type,
        status,
        weight,
        gender,
        birthday,
        breedId,
        locationId,
        codeFather,
        codeMother,
        productionPhase,
        electronicCode,
        organizationId,
        userCreatedId,
      },
    });

    return animal;
  }

  /** Update one Animal in database. */
  async updateOne(
    selections: UpdateAnimalsSelections,
    options: UpdateAnimalsOptions,
  ): Promise<Animal> {
    const { animalId } = selections;
    const {
      code,
      type,
      weight,
      gender,
      status,
      breedId,
      birthday,
      codeFather,
      codeMother,
      productionPhase,
      electronicCode,
      locationId,
      deletedAt,
    } = options;

    const animal = this.client.animal.update({
      where: {
        id: animalId,
      },
      data: {
        code,
        type,
        weight,
        gender,
        status,
        breedId,
        birthday,
        codeFather,
        codeMother,
        productionPhase,
        electronicCode,
        locationId,
        deletedAt,
      },
    });

    return animal;
  }
}
