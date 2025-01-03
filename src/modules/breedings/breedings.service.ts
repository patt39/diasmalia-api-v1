import { Injectable } from '@nestjs/common';
import { Breeding, Prisma } from '@prisma/client';
import {
  dateTimeNowUtc,
  substrateDaysToTimeNowUtcDate,
} from 'src/app/utils/commons';
import { DatabaseService } from '../../app/database/database.service';
import {
  WithPaginationResponse,
  withPagination,
} from '../../app/utils/pagination';
import { FarrowingsService } from '../farrowings/farrowings.service';
import { WeaningsService } from '../weaning/weaning.service';
import {
  BreedingSelect,
  CreateBreedingsOptions,
  GetBreedingHistorySelections,
  GetBreedingsSelections,
  GetOneBreedingsSelections,
  UpdateBreedingsOptions,
  UpdateBreedingsSelections,
} from './breedings.type';

@Injectable()
export class BreedingsService {
  constructor(
    private readonly client: DatabaseService,
    private readonly farrowingsService: FarrowingsService,
    private readonly weaningsService: WeaningsService,
  ) {}

  async findAll(
    selections: GetBreedingsSelections,
  ): Promise<WithPaginationResponse | null> {
    const prismaWhereBreeding = {} as Prisma.BreedingWhereInput;
    const {
      search,
      gender,
      method,
      periode,
      animalId,
      pagination,
      checkStatus,
      animalTypeId,
      animalFemaleId,
      organizationId,
    } = selections;

    if (search) {
      Object.assign(prismaWhereBreeding, {
        OR: [
          { femaleCode: { contains: search, mode: 'insensitive' } },
          { maleCode: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    if (periode) {
      Object.assign(prismaWhereBreeding, {
        createdAt: {
          gte: substrateDaysToTimeNowUtcDate(Number(periode)),
          lte: dateTimeNowUtc(),
        },
      });
    }

    if (organizationId) {
      Object.assign(prismaWhereBreeding, { organizationId });
    }

    if (animalTypeId) {
      Object.assign(prismaWhereBreeding, { animalTypeId });
    }

    if (animalFemaleId) {
      Object.assign(prismaWhereBreeding, { animalFemaleId });
    }

    if (checkStatus) {
      Object.assign(prismaWhereBreeding, { checkStatus });
    }

    if (method) {
      Object.assign(prismaWhereBreeding, { method });
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

    return withPagination({
      pagination,
      rowCount,
      value: breedings,
    });
  }

  async findBreedingHistory(
    selections: GetBreedingHistorySelections,
  ): Promise<WithPaginationResponse | null> {
    const prismaWhereBreeding = {} as Prisma.BreedingWhereInput;
    const { animalFemaleId, pagination, animalTypeId, organizationId } =
      selections;

    if (organizationId) {
      Object.assign(prismaWhereBreeding, { organizationId });
    }

    if (animalTypeId) {
      Object.assign(prismaWhereBreeding, { animalTypeId });
    }

    if (animalFemaleId) {
      Object.assign(prismaWhereBreeding, { animalFemaleId });
    }

    const breedings = await this.client.breeding.findMany({
      take: pagination.take,
      skip: pagination.skip,
      select: BreedingSelect,
      orderBy: pagination.orderBy,
      where: { ...prismaWhereBreeding, deletedAt: null },
    });

    const rowCount = await this.client.breeding.count({
      where: { ...prismaWhereBreeding, deletedAt: null, checkStatus: true },
    });

    const newBreedingArray: any = [];
    for (const breeding of breedings) {
      const findOneAnimalFarrowing = await this.farrowingsService.findOneBy({
        breedingId: breeding?.id,
      });
      const findOneAnimalWeaning = await this.weaningsService.findOneBy({
        farrowingId: findOneAnimalFarrowing?.id,
      });
      newBreedingArray.push({
        ...breeding,
        farrowing: findOneAnimalFarrowing,
        weaning: findOneAnimalWeaning,
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

    const {
      breedingId,
      animalMaleId,
      animalFemaleId,
      animalTypeId,
      organizationId,
      checkStatus,
    } = selections;

    if (breedingId) {
      Object.assign(prismaWhere, { id: breedingId });
    }

    if (organizationId) {
      Object.assign(prismaWhere, { organizationId });
    }

    if (checkStatus) {
      Object.assign(prismaWhere, { checkStatus });
    }

    if (animalMaleId) {
      Object.assign(prismaWhere, { animalMaleId });
    }

    if (animalFemaleId) {
      Object.assign(prismaWhere, { animalFemaleId });
    }

    if (animalTypeId) {
      Object.assign(prismaWhere, { animalTypeId });
    }

    const breeding = await this.client.breeding.findFirst({
      orderBy: { createdAt: 'desc' },
      where: { ...prismaWhere, deletedAt: null },
      select: BreedingSelect,
    });

    return breeding;
  }

  /** Create one breeding in database. */
  async createOne(options: CreateBreedingsOptions): Promise<Breeding> {
    const {
      note,
      method,
      result,
      maleCode,
      femaleCode,
      animalTypeId,
      animalFemaleId,
      animalMaleId,
      organizationId,
      userCreatedId,
    } = options;

    const breeding = this.client.breeding.create({
      data: {
        note,
        method,
        result,
        maleCode,
        femaleCode,
        animalTypeId,
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
    const {
      note,
      method,
      result,
      maleCode,
      femaleCode,
      checkStatus,
      animalFemaleId,
      animalMaleId,
      deletedAt,
    } = options;

    const breeding = this.client.breeding.update({
      where: { id: breedingId },
      data: {
        note,
        method,
        result,
        maleCode,
        femaleCode,
        checkStatus,
        animalFemaleId,
        animalMaleId,
        deletedAt,
      },
    });

    return breeding;
  }
}
