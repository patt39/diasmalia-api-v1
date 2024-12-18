import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Animal, Prisma } from '@prisma/client';
import {
  dateTimeNowUtc,
  substrateDaysToTimeNowUtcDate,
} from 'src/app/utils/commons';
import { DatabaseService } from '../../app/database/database.service';
import {
  WithPaginationResponse,
  withPagination,
} from '../../app/utils/pagination';
import { AssignTypesService } from '../assigne-type/assigne-type.service';
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
  constructor(
    private readonly client: DatabaseService,
    private readonly assignTypesService: AssignTypesService,
  ) {}

  async findAll(
    selections: GetAnimalsSelections,
  ): Promise<WithPaginationResponse | null> {
    const prismaWhere = {} as Prisma.AnimalWhereInput;
    const {
      search,
      status,
      gender,
      locationId,
      isIsolated,
      animalTypeId,
      productionPhase,
      organizationId,
      pagination,
      animalIds,
    } = selections;

    if (search) {
      Object.assign(prismaWhere, {
        OR: [{ code: { contains: search, mode: 'insensitive' } }],
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

    if (isIsolated) {
      Object.assign(prismaWhere, { isIsolated });
    }

    if (locationId) {
      Object.assign(prismaWhere, { locationId });
    }

    if (animalTypeId) {
      Object.assign(prismaWhere, { animalTypeId });
    }

    if (gender) {
      Object.assign(prismaWhere, { gender });
    }

    if (productionPhase) {
      Object.assign(prismaWhere, { productionPhase });
    }

    const animals =
      status !== 'ARCHIVED'
        ? await this.client.animal.findMany({
            where: { ...prismaWhere, deletedAt: null },
            take: pagination.take,
            skip: pagination?.skip,
            select: AnimalSelect,
            orderBy: pagination.orderBy,
          })
        : await this.client.animal.findMany({
            where: { ...prismaWhere },
            take: pagination.take,
            skip: pagination?.skip,
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

  async findArchives(
    selections: GetAnimalsSelections,
  ): Promise<WithPaginationResponse | null> {
    const prismaWhere = {} as Prisma.AnimalWhereInput;
    const { search, status, pagination } = selections;

    if (search) {
      Object.assign(prismaWhere, {
        OR: [{ code: { contains: search, mode: 'insensitive' } }],
      });
    }

    if (status) {
      Object.assign(prismaWhere, { status });
    }

    const animals = await this.client.animal.findMany({
      where: { ...prismaWhere, deletedAt: { not: null }, status: 'SOLD' },
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
      gender,
      status,
      quantity,
      animalId,
      deletedAt,
      codeMother,
      codeFather,
      isIsolated,
      locationId,
      isCastrated,
      animalTypeId,
      organizationId,
      productionPhase,
    } = selections;

    if (animalId) {
      Object.assign(prismaWhere, { id: animalId });
    }

    if (isIsolated) {
      Object.assign(prismaWhere, { isIsolated });
    }

    if (isCastrated) {
      Object.assign(prismaWhere, { isCastrated });
    }

    if (locationId) {
      Object.assign(prismaWhere, { locationId });
    }

    if (gender) {
      Object.assign(prismaWhere, { gender });
    }

    if (animalTypeId) {
      Object.assign(prismaWhere, { animalTypeId });
    }

    if (code) {
      Object.assign(prismaWhere, { code });
    }

    if (codeMother) {
      Object.assign(prismaWhere, { codeMother });
    }

    if (codeFather) {
      Object.assign(prismaWhere, { codeFather });
    }

    if (status) {
      Object.assign(prismaWhere, { status });
    }

    if (deletedAt) {
      Object.assign(prismaWhere, { deletedAt });
    }

    if (quantity) {
      Object.assign(prismaWhere, { quantity });
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

  /** Delete one animal in database. */
  async findDeleteOne(selections: GetOneAnimalsSelections) {
    const prismaWhere = {} as Prisma.AnimalWhereInput;
    const { status, animalId, deletedAt, animalTypeId, organizationId } =
      selections;

    if (animalId) {
      Object.assign(prismaWhere, { id: animalId });
    }

    if (animalTypeId) {
      Object.assign(prismaWhere, { animalTypeId });
    }

    if (status) {
      Object.assign(prismaWhere, { status });
    }

    if (deletedAt) {
      Object.assign(prismaWhere, { deletedAt });
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

  /** Get animal details. */
  async findOneAnimalDetails(
    selections: GetOneAnimalsSelections,
  ): Promise<any> {
    const prismaWhereAnimal = {} as Prisma.AnimalWhereInput;

    const { animalId, animalTypeId, code, status, organizationId } = selections;

    if (animalId) {
      Object.assign(prismaWhereAnimal, { id: animalId });
    }

    if (code) {
      Object.assign(prismaWhereAnimal, { code });
    }

    if (animalTypeId) {
      Object.assign(prismaWhereAnimal, { animalTypeId });
    }

    if (status) {
      Object.assign(prismaWhereAnimal, { status });
    }

    const animal = await this.client.animal.findFirst({
      where: {
        ...prismaWhereAnimal,
        deletedAt: null,
        organizationId,
      },
      select: AnimalSelect,
    });

    const breedingMaleCount = await this.client.breeding.count({
      where: { animalMaleId: animal?.id, deletedAt: null, organizationId },
    });

    const breedingFemaleCount = await this.client.breeding.count({
      where: { animalFemaleId: animal?.id, deletedAt: null, organizationId },
    });

    const farrowingCount = await this.client.farrowing.count({
      where: { animalId: animal?.id, deletedAt: null, organizationId },
    });

    const saleChicken = await this.client.sale.findMany({
      where: {
        detail: 'CHICKENS',
        deletedAt: null,
        organizationId,
        animalId: animal?.id,
        animalTypeId: animal?.animalTypeId,
      },
    });

    const saleEgg = await this.client.sale.findMany({
      where: {
        detail: 'EGGS',
        deletedAt: null,
        organizationId,
        animalId: animal?.id,
        animalTypeId: animal?.animalTypeId,
      },
    });

    const saleChick = await this.client.sale.findMany({
      where: {
        detail: 'CHICKS',
        deletedAt: null,
        organizationId,
        animalId: animal?.id,
        animalTypeId: animal?.animalTypeId,
      },
    });

    const sumEggIncubated = await this.client.incubation.findMany({
      where: {
        deletedAt: null,
        animalId: animal?.id,
        animalTypeId: animal?.animalTypeId,
      },
    });

    const sumDeaths = await this.client.death.findMany({
      where: {
        deletedAt: null,
        organizationId,
        animalId: animal?.id,
        animalTypeId: animal?.animalTypeId,
      },
    });

    const sumFeedings = await this.client.feeding.findMany({
      where: {
        deletedAt: null,
        organizationId,
        animalId: animal?.id,
        animalTypeId: animal?.animalTypeId,
      },
    });
    const sumIsolations = await this.client.isolation.findMany({
      where: {
        deletedAt: null,
        organizationId,
        animalId: animal?.id,
        animalTypeId: animal?.animalTypeId,
      },
    });
    const sumFarrowings = await this.client.farrowing.findMany({
      where: {
        deletedAt: null,
        organizationId,
        animalId: animal?.id,
        animalTypeId: animal?.animalTypeId,
      },
    });
    const sumWeanings = await this.client.weaning.findMany({
      where: {
        deletedAt: null,
        organizationId,
        animalId: animal?.id,
        animalTypeId: animal?.animalTypeId,
      },
    });

    const totalFarrowings = await this.client.farrowing.aggregate({
      where: {
        deletedAt: null,
        animalId: animal?.id,
        animal: { status: 'ACTIVE', deletedAt: null },
        animalTypeId: animalTypeId,
      },
      _sum: {
        litter: true,
      },
      _count: {
        id: true,
      },
    });

    const totalEggsHarvested = await this.client.eggHavesting.aggregate({
      where: {
        deletedAt: null,
        animalId: animal?.id,
        animal: { status: 'ACTIVE', deletedAt: null },
        animalTypeId: animalTypeId,
      },
      _sum: {
        quantity: true,
      },
    });

    const totalExpenses = await this.client.finance.aggregate({
      where: {
        type: 'EXPENSE',
        deletedAt: null,
        animalId: animal?.id,
        //animal: { status: 'ACTIVE', deletedAt: null },
        animalTypeId: animalTypeId,
      },
      _sum: {
        amount: true,
      },
    });

    const initialValue = 0;
    const feedingsCount = sumFeedings.reduce(
      (accumulator: any, currentValue: any) =>
        accumulator + currentValue.quantity,
      initialValue,
    );

    const deathsCount = sumDeaths.reduce(
      (accumulator: any, currentValue: any) =>
        accumulator + currentValue.number,
      initialValue,
    );

    const isolatedCount = sumIsolations.reduce(
      (accumulator: any, currentValue: any) =>
        accumulator + currentValue.number,
      initialValue,
    );

    const incubationCount = sumEggIncubated.reduce(
      (accumulator: any, currentValue: any) =>
        accumulator + currentValue.quantityStart,
      initialValue,
    );

    const eggHatchedCount = sumEggIncubated.reduce(
      (accumulator: any, currentValue: any) =>
        accumulator + currentValue.quantityEnd,
      initialValue,
    );

    const chickenSaleCount = saleChicken.reduce(
      (accumulator: any, currentValue: any) =>
        accumulator + currentValue.number,
      initialValue,
    );

    const chickenSaleAmount = saleChicken.reduce(
      (accumulator: any, currentValue: any) => accumulator + currentValue.price,
      initialValue,
    );

    const chickSaleAmount = saleChick.reduce(
      (accumulator: any, currentValue: any) => accumulator + currentValue.price,
      initialValue,
    );

    const eggSaleAmount = saleEgg.reduce(
      (accumulator: any, currentValue: any) => accumulator + currentValue.price,
      initialValue,
    );

    const chickSaleCount = saleChick.reduce(
      (accumulator: any, currentValue: any) =>
        accumulator + currentValue.number,
      initialValue,
    );

    const eggSaleCount = saleEgg.reduce(
      (accumulator: any, currentValue: any) =>
        accumulator + currentValue.number,
      initialValue,
    );

    const farrowinglitterCount = sumFarrowings.reduce(
      (accumulator: any, currentValue: any) =>
        accumulator + currentValue.litter,
      initialValue,
    );

    const weaninglitterCount = sumWeanings.reduce(
      (accumulator: any, currentValue: any) =>
        accumulator + currentValue.litter,
      initialValue,
    );

    const prolificity =
      totalFarrowings?._sum?.litter / Number(totalFarrowings?._count?.id);

    return {
      ...animal,
      feedingsCount,
      farrowingCount,
      deathsCount,
      prolificity,
      isolatedCount,
      incubationCount,
      eggHatchedCount,
      chickenSaleCount,
      chickSaleCount,
      eggSaleCount,
      breedingMaleCount,
      breedingFemaleCount,
      chickenSaleAmount,
      chickSaleAmount,
      eggSaleAmount,
      farrowinglitterCount,
      weaninglitterCount,
      totalExpenses: totalExpenses?._sum?.amount,
      totalEggsHarvested: totalEggsHarvested?._sum?.quantity,
    };
  }

  /** Find one Animal in database. */
  async findOneByCode(selections: GetOneAnimalsSelections) {
    const { code } = selections;

    const animal = await this.client.animal.findFirst({
      where: {
        code: code,
      },
      select: AnimalSelect,
    });

    return animal;
  }

  /** Create one Animal in database. */
  async createOne(options: CreateAnimalsOptions): Promise<Animal> {
    const {
      code,
      male,
      strain,
      female,
      status,
      weight,
      gender,
      birthday,
      breedId,
      quantity,
      supplier,
      locationId,
      codeFather,
      codeMother,
      animalTypeId,
      productionPhase,
      organizationId,
      userCreatedId,
    } = options;

    const animal = this.client.animal.create({
      data: {
        code,
        male,
        strain,
        female,
        status,
        weight,
        gender,
        birthday,
        breedId,
        quantity,
        supplier,
        locationId,
        codeFather,
        codeMother,
        animalTypeId,
        productionPhase,
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
      male,
      report,
      strain,
      female,
      weight,
      gender,
      status,
      breedId,
      birthday,
      quantity,
      supplier,
      codeFather,
      codeMother,
      isIsolated,
      isCastrated,
      productionPhase,
      locationId,
      deletedAt,
    } = options;

    const animal = this.client.animal.update({
      where: { id: animalId },
      data: {
        code,
        male,
        report,
        strain,
        female,
        weight,
        gender,
        status,
        breedId,
        birthday,
        quantity,
        supplier,
        codeFather,
        codeMother,
        isIsolated,
        isCastrated,
        productionPhase,
        locationId,
        deletedAt,
      },
    });

    return animal;
  }

  /** Delete one Animal in database. */
  async deleteOne(selections: UpdateAnimalsSelections): Promise<Animal> {
    const { animalId } = selections;

    const animal = this.client.animal.delete({
      where: { id: animalId },
    });

    return animal;
  }

  /** Get all animals transactions. */
  async getAnimalTransactions({
    periode,
    animalTypeId,
    organizationId,
  }: {
    periode: string;
    animalTypeId: string;
    organizationId: string;
  }) {
    const prismaWhereSales = {} as Prisma.SaleWhereInput;
    const prismaWhereFarrowings = {} as Prisma.FarrowingWhereInput;
    const prismaWhereWeanings = {} as Prisma.WeaningWhereInput;
    const prismaWhereAnimals = {} as Prisma.AnimalWhereInput;
    const prismaWhereIncubations = {} as Prisma.IncubationWhereInput;
    const prismaWhereEggsHarvestings = {} as Prisma.EggHavestingWhereInput;
    const prismaWhereDeaths = {} as Prisma.DeathWhereInput;
    const prismaWhereFeedings = {} as Prisma.FeedingWhereInput;
    const prismaWhereTreatments = {} as Prisma.TreatmentWhereInput;
    const prismaWhereIsolations = {} as Prisma.IsolationWhereInput;
    const prismaWhereBreedings = {} as Prisma.BreedingWhereInput;
    const prismaWhereMilkings = {} as Prisma.MilkingWhereInput;
    const prismaWhereHealths = {} as Prisma.HealthWhereInput;
    const prismaWhereFeedStocks = {} as Prisma.FeedStockWhereInput;

    const findOneAssignType = await this.assignTypesService.findOneBy({
      animalTypeId,
    });
    if (!findOneAssignType)
      throw new HttpException(
        `AnimalType not assigned please change`,
        HttpStatus.NOT_FOUND,
      );

    if (periode) {
      Object.assign(prismaWhereSales, {
        createdAt: {
          gte: substrateDaysToTimeNowUtcDate(Number(periode)),
          lte: dateTimeNowUtc(),
        },
      });
      Object.assign(prismaWhereFeedings, {
        createdAt: {
          gte: substrateDaysToTimeNowUtcDate(Number(periode)),
          lte: dateTimeNowUtc(),
        },
      });
      Object.assign(prismaWhereDeaths, {
        createdAt: {
          gte: substrateDaysToTimeNowUtcDate(Number(periode)),
          lte: dateTimeNowUtc(),
        },
      });
      Object.assign(prismaWhereIsolations, {
        createdAt: {
          gte: substrateDaysToTimeNowUtcDate(Number(periode)),
          lte: dateTimeNowUtc(),
        },
      });
      Object.assign(prismaWhereBreedings, {
        createdAt: {
          gte: substrateDaysToTimeNowUtcDate(Number(periode)),
          lte: dateTimeNowUtc(),
        },
      });
      Object.assign(prismaWhereMilkings, {
        createdAt: {
          gte: substrateDaysToTimeNowUtcDate(Number(periode)),
          lte: dateTimeNowUtc(),
        },
      });
    }
    const [
      sumMales,
      sumFemales,
      sumFemaleGrowth,
      sumMaleGrowth,
      sumAnimalFattening,
      sumFemaleReproduction,
      sumMaleReproduction,
      sumFemaleGestation,
      sumFemaleLactation,
      totalFarrowings,
      totalWeanings,
      totalSumAnimals,
      totalEggHarvested,
      totalDeaths,
      totalFeedings,
      totalIncubations,
      totalSaleChicks,
      totalSaleEggs,
      totalSaleChickens,
      totalSaleAnimals,
      totalIsolations,
      totalStocks,
      totalMilkings,
      sumTreatments,
      sumMedications,
      totalBreedings,
      totalPositiveBreedings,
    ] = await this.client.$transaction([
      this.client.animal.count({
        where: {
          gender: 'MALE',
          status: 'ACTIVE',
          animalTypeId: animalTypeId,
          deletedAt: null,
          organizationId: organizationId,
        },
      }),
      this.client.animal.count({
        where: {
          gender: 'FEMALE',
          status: 'ACTIVE',
          animalTypeId: animalTypeId,
          deletedAt: null,
          organizationId: organizationId,
        },
      }),
      this.client.animal.count({
        where: {
          gender: 'FEMALE',
          status: 'ACTIVE',
          productionPhase: 'GROWTH',
          animalTypeId: animalTypeId,
          deletedAt: null,
          organizationId: organizationId,
        },
      }),
      this.client.animal.count({
        where: {
          gender: 'MALE',
          status: 'ACTIVE',
          productionPhase: 'GROWTH',
          animalTypeId: animalTypeId,
          deletedAt: null,
          organizationId: organizationId,
        },
      }),
      this.client.animal.count({
        where: {
          status: 'ACTIVE',
          productionPhase: 'FATTENING',
          animalTypeId: animalTypeId,
          deletedAt: null,
          organizationId: organizationId,
        },
      }),
      this.client.animal.count({
        where: {
          gender: 'FEMALE',
          status: 'ACTIVE',
          animalTypeId: animalTypeId,
          productionPhase: 'REPRODUCTION',
          deletedAt: null,
          organizationId: organizationId,
        },
      }),
      this.client.animal.count({
        where: {
          gender: 'MALE',
          status: 'ACTIVE',
          animalTypeId: animalTypeId,
          productionPhase: 'REPRODUCTION',
          deletedAt: null,
          organizationId: organizationId,
        },
      }),
      this.client.animal.count({
        where: {
          gender: 'FEMALE',
          status: 'ACTIVE',
          animalTypeId: animalTypeId,
          productionPhase: 'GESTATION',
          deletedAt: null,
          organizationId: organizationId,
        },
      }),
      this.client.animal.count({
        where: {
          gender: 'FEMALE',
          status: 'ACTIVE',
          animalTypeId: animalTypeId,
          productionPhase: 'LACTATION',
          deletedAt: null,
          organizationId: organizationId,
        },
      }),
      this.client.farrowing.aggregate({
        where: {
          deletedAt: null,
          ...prismaWhereFarrowings,
          animal: { status: 'ACTIVE', deletedAt: null },
          animalTypeId: animalTypeId,
          organizationId: organizationId,
        },
        _sum: {
          litter: true,
        },
        _count: {
          id: true,
        },
      }),
      this.client.weaning.aggregate({
        where: {
          deletedAt: null,
          ...prismaWhereWeanings,
          animal: { status: 'ACTIVE', deletedAt: null },
          animalTypeId: animalTypeId,
          organizationId: organizationId,
        },
        _sum: {
          litter: true,
        },
      }),
      this.client.animal.aggregate({
        where: {
          quantity: { not: 0 },
          deletedAt: null,
          status: 'ACTIVE',
          ...prismaWhereAnimals,
          animalTypeId: animalTypeId,
          organizationId: organizationId,
        },
        _sum: {
          female: true,
          male: true,
          weight: true,
          quantity: true,
        },
        _count: {
          id: true,
        },
      }),
      this.client.eggHavesting.aggregate({
        where: {
          deletedAt: null,
          animalTypeId: animalTypeId,
          ...prismaWhereEggsHarvestings,
          animal: { status: 'ACTIVE', deletedAt: null },
          organizationId: organizationId,
        },
        _sum: {
          quantity: true,
        },
      }),
      this.client.death.aggregate({
        where: {
          deletedAt: null,
          ...prismaWhereDeaths,
          animalTypeId: animalTypeId,
          animal: { status: 'ACTIVE', deletedAt: null },
          organizationId: organizationId,
        },
        _sum: {
          number: true,
        },
      }),
      this.client.feeding.aggregate({
        where: {
          deletedAt: null,
          ...prismaWhereFeedings,
          animalTypeId: animalTypeId,
          animal: { status: 'ACTIVE', deletedAt: null },
          organizationId: organizationId,
        },
        _sum: {
          quantity: true,
        },
      }),
      this.client.incubation.aggregate({
        where: {
          deletedAt: null,
          ...prismaWhereIncubations,
          animalTypeId: animalTypeId,
          animal: { status: 'ACTIVE', deletedAt: null },
          organizationId: organizationId,
        },
        _sum: {
          quantityEnd: true,
          quantityStart: true,
        },
      }),
      this.client.sale.aggregate({
        where: {
          ...prismaWhereSales,
          detail: 'CHICKS',
          deletedAt: null,
          animal: { status: 'ACTIVE', deletedAt: null },
          animalTypeId: animalTypeId,
          organizationId: organizationId,
        },
        _sum: {
          price: true,
          number: true,
        },
      }),
      this.client.sale.aggregate({
        where: {
          ...prismaWhereSales,
          detail: 'EGGS',
          animal: { status: 'ACTIVE', deletedAt: null },
          animalTypeId: animalTypeId,
          deletedAt: null,
          organizationId: organizationId,
        },
        _sum: {
          price: true,
          number: true,
        },
      }),
      this.client.sale.aggregate({
        where: {
          ...prismaWhereSales,
          detail: 'CHICKENS',
          animal: { status: 'ACTIVE', deletedAt: null },
          animalTypeId: animalTypeId,
          deletedAt: null,
          organizationId: organizationId,
        },
        _sum: {
          price: true,
          number: true,
        },
      }),
      this.client.sale.aggregate({
        where: {
          detail: null,
          animals: { not: null },
          ...prismaWhereSales,
          animalTypeId: animalTypeId,
          deletedAt: null,
          organizationId: organizationId,
        },
        _sum: {
          price: true,
        },
      }),
      this.client.isolation.aggregate({
        where: {
          animal: { status: 'ACTIVE', deletedAt: null },
          ...prismaWhereIsolations,
          animalTypeId: animalTypeId,
          deletedAt: null,
          organizationId: organizationId,
        },
        _sum: {
          number: true,
        },
      }),
      this.client.feedStock.aggregate({
        where: {
          deletedAt: null,
          ...prismaWhereFeedStocks,
          organizationId: organizationId,
        },
        _sum: {
          number: true,
          weight: true,
        },
      }),
      this.client.milking.aggregate({
        where: {
          ...prismaWhereMilkings,
          animal: { status: 'ACTIVE', deletedAt: null },
          animalTypeId: animalTypeId,
          deletedAt: null,
          organizationId: organizationId,
        },
        _sum: {
          quantity: true,
        },
      }),
      this.client.treatment.count({
        where: {
          ...prismaWhereTreatments,
          animalTypeId: animalTypeId,
          deletedAt: null,
          organizationId: organizationId,
        },
      }),
      this.client.health.count({
        where: {
          status: true,
          ...prismaWhereHealths,
          deletedAt: null,
          organizationId: organizationId,
        },
      }),
      this.client.breeding.count({
        where: {
          ...prismaWhereBreedings,
          animalTypeId: animalTypeId,
          deletedAt: null,
          organizationId: organizationId,
        },
      }),
      this.client.breeding.count({
        where: {
          result: 'PREGNANT',
          ...prismaWhereBreedings,
          animalTypeId: animalTypeId,
          deletedAt: null,
          organizationId: organizationId,
        },
      }),
    ]);

    const averageWeight =
      totalSumAnimals?._sum?.weight / Number(totalSumAnimals?._count?.id);

    const prolificity =
      totalFarrowings?._sum?.litter / Number(totalFarrowings?._count?.id);

    return {
      sumMales,
      sumFemales,
      sumFemaleGrowth,
      sumMaleGrowth,
      sumAnimalFattening,
      sumFemaleReproduction,
      sumMaleReproduction,
      sumFemaleGestation,
      sumFemaleLactation,
      sumFarrowings: totalFarrowings?._sum?.litter,
      sumWeanings: totalWeanings?._sum?.litter,
      sumAnimalsQuantity: totalSumAnimals?._sum,
      averageWeight: averageWeight,
      prolificity: prolificity,
      sumEggHarvested: totalEggHarvested._sum?.quantity,
      sumDeaths: totalDeaths?._sum?.number,
      sumFeedings: totalFeedings?._sum?.quantity,
      sumIncubations: totalIncubations._sum?.quantityStart,
      sumHatched: totalIncubations?._sum?.quantityEnd,
      sumSaleChicks: totalSaleChicks._sum,
      sumSaleEggs: totalSaleEggs._sum,
      sumSaleChickens: totalSaleChickens._sum,
      sumSaleAnimals: totalSaleAnimals._sum?.price,
      sumIsolations: totalIsolations._sum.number,
      sumStocks: totalStocks._sum,
      sumMilkings: totalMilkings._sum?.quantity,
      sumTreatments,
      sumMedications,
      totalBreedings,
      totalPositiveBreedings,
    };
  }

  /** Get animal sold and dead transactions. */
  async getAllAnimalTransactions({
    animalTypeId,
    organizationId,
  }: {
    animalTypeId: string;
    organizationId: string;
  }) {
    const findOneAssignType = await this.assignTypesService.findOneBy({
      animalTypeId,
    });
    if (!findOneAssignType)
      throw new HttpException(
        `AnimalType not assigned please change`,
        HttpStatus.NOT_FOUND,
      );
    const [
      animalSold,
      animalsDead,
      sumAnimalMaleGrowthSold,
      sumAnimalFemaleGrowthSold,
      sumFemaleGestationSold,
      sumAnimalFatteningSold,
      sumFemaleReproductionSold,
      sumMaleReproductionSold,
      sumAnimalMaleGrowthDead,
      sumAnimalFemaleGrowthDead,
      sumAnimalFatteningDead,
      sumFemaleReproductionDead,
      sumMaleReproductionDead,
      sumFemaleGestationDead,
    ] = await this.client.$transaction([
      this.client.animal.count({
        where: {
          status: 'SOLD',
          animalTypeId: animalTypeId,
          organizationId: organizationId,
        },
      }),
      this.client.animal.count({
        where: {
          status: 'DEAD',
          animalTypeId: animalTypeId,
          organizationId: organizationId,
        },
      }),
      this.client.animal.count({
        where: {
          status: 'SOLD',
          gender: 'MALE',
          productionPhase: 'GROWTH',
          animalTypeId: animalTypeId,
          organizationId: organizationId,
        },
      }),
      this.client.animal.count({
        where: {
          status: 'SOLD',
          gender: 'FEMALE',
          productionPhase: 'GROWTH',
          animalTypeId: animalTypeId,
          organizationId: organizationId,
        },
      }),
      this.client.animal.count({
        where: {
          status: 'SOLD',
          gender: 'FEMALE',
          productionPhase: 'GESTATION',
          animalTypeId: animalTypeId,
          organizationId: organizationId,
        },
      }),
      this.client.animal.count({
        where: {
          status: 'SOLD',
          productionPhase: 'FATTENING',
          animalTypeId: animalTypeId,
          organizationId: organizationId,
        },
      }),
      this.client.animal.count({
        where: {
          status: 'SOLD',
          gender: 'FEMALE',
          productionPhase: 'REPRODUCTION',
          animalTypeId: animalTypeId,
          organizationId: organizationId,
        },
      }),
      this.client.animal.count({
        where: {
          status: 'SOLD',
          gender: 'MALE',
          productionPhase: 'REPRODUCTION',
          animalTypeId: animalTypeId,
          organizationId: organizationId,
        },
      }),
      this.client.animal.count({
        where: {
          status: 'SOLD',
          gender: 'FEMALE',
          productionPhase: 'REPRODUCTION',
          animalTypeId: animalTypeId,
          organizationId: organizationId,
        },
      }),
      this.client.animal.count({
        where: {
          status: 'SOLD',
          gender: 'MALE',
          productionPhase: 'REPRODUCTION',
          animalTypeId: animalTypeId,
          organizationId: organizationId,
        },
      }),
      this.client.animal.count({
        where: {
          status: 'DEAD',
          gender: 'MALE',
          productionPhase: 'GROWTH',
          animalTypeId: animalTypeId,
          organizationId: organizationId,
        },
      }),
      this.client.animal.count({
        where: {
          status: 'DEAD',
          gender: 'FEMALE',
          productionPhase: 'GROWTH',
          animalTypeId: animalTypeId,
          organizationId: organizationId,
        },
      }),
      this.client.animal.count({
        where: {
          status: 'DEAD',
          gender: 'FEMALE',
          productionPhase: 'FATTENING',
          animalTypeId: animalTypeId,
          organizationId: organizationId,
        },
      }),
      this.client.animal.count({
        where: {
          status: 'DEAD',
          gender: 'FEMALE',
          productionPhase: 'REPRODUCTION',
          animalTypeId: animalTypeId,
          organizationId: organizationId,
        },
      }),
      this.client.animal.count({
        where: {
          status: 'DEAD',
          gender: 'MALE',
          productionPhase: 'REPRODUCTION',
          animalTypeId: animalTypeId,
          organizationId: organizationId,
        },
      }),
      this.client.animal.count({
        where: {
          status: 'DEAD',
          gender: 'FEMALE',
          productionPhase: 'GESTATION',
          animalTypeId: animalTypeId,
          organizationId: organizationId,
        },
      }),
    ]);

    return {
      animalSold,
      animalsDead,
      sumAnimalMaleGrowthSold,
      sumAnimalFemaleGrowthSold,
      sumFemaleGestationSold,
      sumAnimalFatteningSold,
      sumFemaleReproductionSold,
      sumMaleReproductionSold,
      sumAnimalMaleGrowthDead,
      sumAnimalFemaleGrowthDead,
      sumAnimalFatteningDead,
      sumFemaleReproductionDead,
      sumMaleReproductionDead,
      sumFemaleGestationDead,
    };
  }
}
