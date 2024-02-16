import { Injectable } from '@nestjs/common';
import { Breed, Prisma } from '@prisma/client';
import { DatabaseService } from '../../app/database/database.service';
import {
  WithPaginationResponse,
  withPagination,
} from '../../app/utils/pagination';
import {
  BreedsSelect,
  BreedsTypeSelect,
  CreateBreedsOptions,
  GetBreedsSelections,
  GetOneBreedsSelections,
  UpdateBreedsOptions,
  UpdateBreedsSelections,
} from './breeds.type';

@Injectable()
export class BreedsService {
  constructor(private readonly client: DatabaseService) {}

  async findAll(
    selections: GetBreedsSelections,
  ): Promise<WithPaginationResponse | null> {
    const prismaWhere = {} as Prisma.BreedWhereInput;
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

    const breeds = await this.client.breed.findMany({
      where: { ...prismaWhere, deletedAt: null },
      take: pagination.take,
      skip: pagination.skip,
      select: BreedsSelect,
      orderBy: pagination.orderBy,
    });

    const rowCount = await this.client.breed.count({
      where: { ...prismaWhere, deletedAt: null },
    });

    return withPagination({
      pagination,
      rowCount,
      value: breeds,
    });
  }

  /** Find one breed in database. */
  async findOneBy(selections: GetOneBreedsSelections) {
    const prismaWhere = {} as Prisma.BreedWhereInput;

    const { breedId, type, organizationId } = selections;

    if (breedId) {
      Object.assign(prismaWhere, { id: breedId });
    }

    if (organizationId) {
      Object.assign(prismaWhere, { organizationId });
    }

    if (type) {
      Object.assign(prismaWhere, { type });
    }

    const breed = await this.client.breed.findFirst({
      where: { ...prismaWhere, deletedAt: null },
    });

    return breed;
  }

  /** Find one breed in database. */
  async findOneTypeBreeds(selections: GetOneBreedsSelections) {
    const prismaWhere = {} as Prisma.BreedWhereInput;

    const { breedId, type, organizationId, pagination } = selections;

    if (breedId) {
      Object.assign(prismaWhere, { id: breedId });
    }

    if (organizationId) {
      Object.assign(prismaWhere, { organizationId });
    }

    if (type) {
      Object.assign(prismaWhere, { type });
    }

    const breeds = await this.client.breed.findMany({
      where: { ...prismaWhere, deletedAt: null },
      take: pagination.take,
      skip: pagination.skip,
      select: BreedsTypeSelect,
      orderBy: pagination.orderBy,
    });

    const breedsCount = await this.client.breed.count({
      where: { ...prismaWhere, deletedAt: null, organizationId },
    });

    const rowCount = await this.client.breed.count({
      where: { ...prismaWhere, deletedAt: null },
    });

    return withPagination({
      pagination,
      rowCount,
      value: [breedsCount, breeds],
    });

    // const breedCount = await this.client.breed.count({
    //   where: { ...prismaWhere, deletedAt: null, organizationId },
    // });
    // const breeds = await this.client.breed.findMany({
    //   where: {
    //     ...prismaWhere,
    //     deletedAt: null,
    //     organizationId,
    //   },
    //   select: BreedsTypeSelect,
    // });

    // return { breedCount, ...breeds };
  }

  /** Create one breed in database. */
  async createOne(options: CreateBreedsOptions): Promise<Breed> {
    const { name, type, organizationId, userCreatedId } = options;

    const breed = this.client.breed.create({
      data: {
        name,
        type,
        organizationId,
        userCreatedId,
      },
    });

    return breed;
  }

  /** Update one breed in database. */
  async updateOne(
    selections: UpdateBreedsSelections,
    options: UpdateBreedsOptions,
  ): Promise<Breed> {
    const { breedId } = selections;
    const { name, deletedAt } = options;

    const Breed = this.client.breed.update({
      where: {
        id: breedId,
      },
      data: { name, deletedAt },
    });

    return Breed;
  }
}
