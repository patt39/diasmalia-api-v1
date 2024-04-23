import { Injectable } from '@nestjs/common';
import { AnimalType, Prisma } from '@prisma/client';
import { DatabaseService } from '../../app/database/database.service';
import {
  WithPaginationResponse,
  withPagination,
} from '../../app/utils/pagination';
import {
  AnimalTypesSelections,
  CreateAnimalTypesOptions,
  GetOneAnimalTypeSelections,
  UpdateAnimalTypesOptions,
  UpdateAnimalTypesSelections,
} from './animal-type.type';

@Injectable()
export class AnimalTypesService {
  constructor(private readonly client: DatabaseService) {}

  async findAll(
    selections: AnimalTypesSelections,
  ): Promise<WithPaginationResponse | null> {
    const prismaWhere = {} as Prisma.AnimalTypeWhereInput;
    const { search, pagination } = selections;

    if (search) {
      Object.assign(prismaWhere, {
        OR: [
          {
            name: { contains: search, mode: 'insensitive' },
          },
        ],
      });
    }

    const animalType = await this.client.animalType.findMany({
      where: { ...prismaWhere, deletedAt: null },
      take: pagination.take,
      skip: pagination.skip,
      orderBy: pagination.orderBy,
    });

    const rowCount = await this.client.animalType.count({
      where: { ...prismaWhere, deletedAt: null },
    });

    return withPagination({
      pagination,
      rowCount,
      value: animalType,
    });
  }
  /** Find one animalType in database. */
  async findOneBy(selections: GetOneAnimalTypeSelections) {
    const prismaWhere = {} as Prisma.AnimalTypeWhereInput;
    const { name, animalTypeId } = selections;

    if (animalTypeId) {
      Object.assign(prismaWhere, { id: animalTypeId });
    }

    if (name) {
      Object.assign(prismaWhere, { name });
    }

    const animalType = await this.client.animalType.findFirst({
      where: { ...prismaWhere, deletedAt: null },
    });

    return animalType;
  }

  /** Create one animalType in database. */
  async createOne(options: CreateAnimalTypesOptions): Promise<AnimalType> {
    const { name, icon } = options;

    const animalType = this.client.animalType.create({
      data: {
        name,
        icon,
      },
    });

    return animalType;
  }

  /** Update one animalType in database. */
  async updateOne(
    selections: UpdateAnimalTypesSelections,
    options: UpdateAnimalTypesOptions,
  ): Promise<AnimalType> {
    const { animalTypeId } = selections;
    const { name, icon } = options;

    const animalType = this.client.animalType.update({
      where: {
        id: animalTypeId,
      },
      data: {
        name,
        icon,
      },
    });

    return animalType;
  }
}
