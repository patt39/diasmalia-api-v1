import { Injectable } from '@nestjs/common';
import {
  CreateBreedsOptions,
  GetBreedsSelections,
  GetOneBreedsSelections,
  UpdateBreedsOptions,
  UpdateBreedsSelections,
  BreedsSelect,
} from './breeds.type';
import { DatabaseService } from '../../app/database/database.service';
import {
  WithPaginationResponse,
  withPagination,
} from '../../app/utils/pagination';
import { Breed, Prisma } from '@prisma/client';

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

  /** Find one Breeds in database. */
  async findOneBy(selections: GetOneBreedsSelections) {
    const { breedId } = selections;
    const contact = await this.client.breed.findUnique({
      select: BreedsSelect,
      where: {
        id: breedId,
      },
    });

    return contact;
  }

  /** Create one Breeds to the database. */
  async createOne(options: CreateBreedsOptions): Promise<Breed> {
    const { name, organizationId, userCreatedId } = options;

    const breed = this.client.breed.create({
      data: {
        name,
        organizationId,
        userCreatedId,
      },
    });

    return breed;
  }

  /** Update one Breedss to the database. */
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
