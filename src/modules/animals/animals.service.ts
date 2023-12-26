import { Injectable } from '@nestjs/common';
import {
  CreateAnimalsOptions,
  GetAnimalsSelections,
  GetOneAnimalsSelections,
  UpdateAnimalsOptions,
  UpdateAnimalsSelections,
  AnimalSelect,
} from './animals.type';
import { DatabaseService } from '../../app/database/database.service';
import {
  WithPaginationResponse,
  withPagination,
} from '../../app/utils/pagination';
import { Animal, Prisma } from '@prisma/client';

@Injectable()
export class AnimalsService {
  constructor(private readonly client: DatabaseService) {}

  async findAll(
    selections: GetAnimalsSelections,
  ): Promise<WithPaginationResponse | null> {
    const prismaWhere = {} as Prisma.AnimalWhereInput;
    const { search, organizationId, pagination } = selections;

    if (search) {
      Object.assign(prismaWhere, {
        OR: [
          {
            code: { contains: search, mode: 'insensitive' },
            codeFather: { contains: search, mode: 'insensitive' },
            codeMother: { contains: search, mode: 'insensitive' },
          },
        ],
      });
    }

    if (organizationId) {
      Object.assign(prismaWhere, { organizationId });
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

  /** Find one Animals to the database. */
  async findOneBy(selections: GetOneAnimalsSelections) {
    const { animalId } = selections;
    const animal = await this.client.animal.findUnique({
      select: AnimalSelect,
      where: {
        id: animalId,
      },
    });

    return animal;
  }

  /** Create one Animals to the database. */
  async createOne(options: CreateAnimalsOptions): Promise<Animal> {
    const {
      code,
      codeFather,
      codeMother,
      birthday,
      weight,
      gender,
      productionPhase,
      electronicCode,
      animalStatusId,
      locationId,
      breedId,
      organizationId,
      userCreatedId,
    } = options;

    const animal = this.client.animal.create({
      data: {
        code,
        codeFather,
        codeMother,
        birthday,
        weight,
        gender,
        productionPhase,
        electronicCode,
        animalStatusId,
        locationId,
        breedId,
        organizationId,
        userCreatedId,
      },
    });

    return animal;
  }

  /** Update one Animals to the database. */
  async updateOne(
    selections: UpdateAnimalsSelections,
    options: UpdateAnimalsOptions,
  ): Promise<Animal> {
    const { animalId } = selections;
    const {
      code,
      codeFather,
      codeMother,
      birthday,
      weight,
      gender,
      productionPhase,
      electronicCode,
      animalStatusId,
      locationId,
      breedId,
      deletedAt,
    } = options;

    const animal = this.client.animal.update({
      where: {
        id: animalId,
      },
      data: {
        code,
        codeFather,
        codeMother,
        birthday,
        weight,
        gender,
        productionPhase,
        electronicCode,
        animalStatusId,
        locationId,
        breedId,
        deletedAt,
      },
    });

    return animal;
  }
}
