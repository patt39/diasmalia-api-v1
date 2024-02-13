import { Injectable } from '@nestjs/common';
import { Breeding, Prisma } from '@prisma/client';
import { DatabaseService } from '../../app/database/database.service';
import {
  WithPaginationResponse,
  withPagination,
} from '../../app/utils/pagination';
import { AnimalsService } from '../animals/animals.service';
import { AnimalSelect } from '../animals/animals.type';
import {
  BreedingSelect,
  CreateBreedingsOptions,
  GetBreedingsSelections,
  GetOneBreedingsSelections,
  UpdateBreedingsOptions,
  UpdateBreedingsSelections,
} from './breedings.type';

@Injectable()
export class BreedingsService {
  constructor(
    private readonly client: DatabaseService,
    private readonly animalsService: AnimalsService,
  ) {}

  async findAll(
    selections: GetBreedingsSelections,
  ): Promise<WithPaginationResponse | null> {
    const prismaWhereBreeding = {} as Prisma.BreedingWhereInput;
    const { search, organizationId, pagination, animalId, gender } = selections;

    if (search) {
      Object.assign(prismaWhereBreeding, {
        OR: [
          {
            animalFemaleId: { contains: search, mode: 'insensitive' },
          },
          {
            animalMaleId: { contains: search, mode: 'insensitive' },
          },
        ],
      });
    }

    if (organizationId) {
      Object.assign(prismaWhereBreeding, { organizationId });
    }

    if (animalId && gender === 'MALE') {
      Object.assign(prismaWhereBreeding, { animalMaleId: animalId });
    }

    if (animalId && gender === 'FEMALE') {
      Object.assign(prismaWhereBreeding, { animalFemaleId: animalId });
    }

    const breedings = await this.client.breeding.findMany({
      take: pagination.take,
      skip: pagination.skip,
      select: BreedingSelect,
      orderBy: pagination.orderBy,
      where: { ...prismaWhereBreeding, deletedAt: null },
    });

    const rowCount = await this.client.breeding.count({
      where: { ...prismaWhereBreeding, deletedAt: null },
    });

    const newBreedingArray: any = [];
    for (const breeding of breedings) {
      const findOneAnimal =
        gender === 'MALE'
          ? await this.animalsService.findOneBy({
              animalId: breeding?.animalFemaleId,
            })
          : await this.animalsService.findOneBy({
              animalId: breeding?.animalMaleId,
            });
      newBreedingArray.push({
        ...breeding,
        animal: findOneAnimal,
      });
    }

    return withPagination({
      pagination,
      rowCount,
      value: newBreedingArray,
    });
  }

  async findBreedingBy(selections: GetOneBreedingsSelections): Promise<any> {
    const prismaWhereBreeding = {} as Prisma.BreedingWhereInput;
    const { animalId, gender, organizationId } = selections;

    if (animalId && gender === 'MALE') {
      Object.assign(prismaWhereBreeding, { animalMaleId: animalId });
    }

    if (animalId && gender === 'FEMALE') {
      Object.assign(prismaWhereBreeding, { animalFemaleId: animalId });
    }

    const breedings = await this.client.breeding.groupBy({
      by: ['animalMaleId', 'animalFemaleId'],
      where: { ...prismaWhereBreeding, deletedAt: null, organizationId },
    });

    return breedings;
  }
  /** Find one breeding in database. */
  async findOneBy(selections: GetOneBreedingsSelections) {
    const prismaWhere = {} as Prisma.BreedingWhereInput;

    const { breedingId, organizationId, checkStatus } = selections;

    if (breedingId) {
      Object.assign(prismaWhere, { id: breedingId });
    }

    if (organizationId) {
      Object.assign(prismaWhere, { organizationId });
    }

    if (checkStatus) {
      Object.assign(prismaWhere, { checkStatus });
    }

    const breeding = await this.client.breeding.findFirst({
      where: { ...prismaWhere, deletedAt: null },
    });

    return breeding;
  }

  /** Find one breeding in database. */
  async findOneBreedingBy(selections: GetOneBreedingsSelections): Promise<any> {
    const prismaWhereBreeding = {} as Prisma.BreedingWhereInput;
    const prismaWhereAnimal = {} as Prisma.AnimalWhereInput;

    const { animalId, gender, organizationId } = selections;

    if (animalId) {
      Object.assign(prismaWhereAnimal, { id: animalId });
    }

    if (animalId && gender === 'MALE') {
      Object.assign(prismaWhereBreeding, { animalMaleId: animalId });
    }

    if (animalId && gender === 'FEMALE') {
      Object.assign(prismaWhereBreeding, { animalFemaleId: animalId });
    }
    const breedingCount = await this.client.breeding.count({
      where: { ...prismaWhereBreeding, deletedAt: null, organizationId },
    });
    const animal = await this.client.animal.findFirst({
      where: {
        ...prismaWhereAnimal,
        deletedAt: null,
        organizationId,
      },
      select: AnimalSelect,
    });

    return { breedingCount, ...animal };
  }
  /** Create one breeding in database. */
  async createOne(options: CreateBreedingsOptions): Promise<Breeding> {
    const {
      date,
      note,
      method,
      animalFemaleId,
      animalMaleId,
      organizationId,
      userCreatedId,
    } = options;

    const breeding = this.client.breeding.create({
      data: {
        date,
        note,
        method,
        animalFemaleId,
        animalMaleId,
        organizationId,
        userCreatedId,
      },
    });

    return breeding;
  }

  /** Update one breeding in database. */
  async updateOne(
    selections: UpdateBreedingsSelections,
    options: UpdateBreedingsOptions,
  ): Promise<Breeding> {
    const { breedingId } = selections;
    const { date, note, method, animalFemaleId, animalMaleId, deletedAt } =
      options;

    const breeding = this.client.breeding.update({
      where: {
        id: breedingId,
      },
      data: {
        date,
        note,
        method,
        animalFemaleId,
        animalMaleId,
        deletedAt,
      },
    });

    return breeding;
  }
}
