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

    if (animalTypeId) {
      Object.assign(prismaWhere, { animalTypeId });
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
      gender,
      status,
      quantity,
      animalId,
      isIsolated,
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

    if (gender) {
      Object.assign(prismaWhere, { gender });
    }

    if (animalTypeId) {
      Object.assign(prismaWhere, { animalTypeId });
    }

    if (code) {
      Object.assign(prismaWhere, { code });
    }

    if (status) {
      Object.assign(prismaWhere, { status });
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

  /** Find one breeding in database. */
  async findOneAnimalDetails(
    selections: GetOneAnimalsSelections,
  ): Promise<any> {
    const prismaWhereAnimal = {} as Prisma.AnimalWhereInput;

    const { animalId, code, status, organizationId } = selections;

    if (animalId) {
      Object.assign(prismaWhereAnimal, { id: animalId });
    }

    if (code) {
      Object.assign(prismaWhereAnimal, { code });
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

    const breedingCount = await this.client.breeding.count({
      where: { animalMaleId: animal?.id, deletedAt: null, organizationId },
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
    const sumEggHarvestings = await this.client.eggHavesting.findMany({
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

    const eggHavestedCount = sumEggHarvestings.reduce(
      (accumulator: any, currentValue: any) =>
        accumulator + currentValue.quantity,
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

    return {
      ...animal,
      breedingCount,
      feedingsCount,
      deathsCount,
      isolatedCount,
      eggHavestedCount,
      incubationCount,
      eggHatchedCount,
      chickenSaleCount,
      chickSaleCount,
      eggSaleCount,
      chickenSaleAmount,
      farrowinglitterCount,
      weaninglitterCount,
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

  // const weaning = await this.client.weaning.findUnique({
  //   select: WeaningSelect,
  //
  // });

  /** Create one Animal in database. */
  async createOne(options: CreateAnimalsOptions): Promise<Animal> {
    const {
      code,
      male,
      female,
      status,
      weight,
      gender,
      birthday,
      breedId,
      quantity,
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
        female,
        status,
        weight,
        gender,
        birthday,
        breedId,
        quantity,
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
      female,
      photo,
      weight,
      gender,
      status,
      breedId,
      birthday,
      quantity,
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
        photo,
        male,
        female,
        weight,
        gender,
        status,
        breedId,
        birthday,
        quantity,
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

  /** Load data to database. */
  async getAnimalTransactions({
    periode,
    animalTypeId,
  }: {
    periode: string;
    animalTypeId: string;
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
      sumAnimalGrowthSale,
      sumFemaleGestationSold,
      sumAnimalFatteningSold,
      sumFemaleReproductionSold,
      sumMaleReproductionSold,
      sumAnimalGrowthDead,
      sumAnimalFatteningDead,
      sumVaccins,
      sumBreedings,
      sumTreatments,
      totalBreedings,
      totalPositiveBreedings,
    ] = await this.client.$transaction([
      this.client.animal.count({
        where: {
          gender: 'MALE',
          status: 'ACTIVE',
          animalTypeId: animalTypeId,
          deletedAt: null,
        },
      }),
      this.client.animal.count({
        where: {
          gender: 'FEMALE',
          status: 'ACTIVE',
          animalTypeId: animalTypeId,
          deletedAt: null,
        },
      }),
      this.client.animal.count({
        where: {
          gender: 'FEMALE',
          status: 'ACTIVE',
          productionPhase: 'GROWTH',
          animalTypeId: animalTypeId,
          deletedAt: null,
        },
      }),
      this.client.animal.count({
        where: {
          gender: 'MALE',
          status: 'ACTIVE',
          productionPhase: 'GROWTH',
          animalTypeId: animalTypeId,
          deletedAt: null,
        },
      }),
      this.client.animal.count({
        where: {
          status: 'ACTIVE',
          productionPhase: 'FATTENING',
          animalTypeId: animalTypeId,
          deletedAt: null,
        },
      }),
      this.client.animal.count({
        where: {
          gender: 'FEMALE',
          status: 'ACTIVE',
          animalTypeId: animalTypeId,
          productionPhase: 'REPRODUCTION',
          deletedAt: null,
        },
      }),
      this.client.animal.count({
        where: {
          gender: 'MALE',
          status: 'ACTIVE',
          animalTypeId: animalTypeId,
          productionPhase: 'REPRODUCTION',
          deletedAt: null,
        },
      }),
      this.client.animal.count({
        where: {
          gender: 'FEMALE',
          status: 'ACTIVE',
          animalTypeId: animalTypeId,
          productionPhase: 'GESTATION',
          deletedAt: null,
        },
      }),
      this.client.animal.count({
        where: {
          gender: 'FEMALE',
          status: 'ACTIVE',
          animalTypeId: animalTypeId,
          productionPhase: 'LACTATION',
          deletedAt: null,
        },
      }),
      this.client.farrowing.aggregate({
        where: {
          deletedAt: null,
          ...prismaWhereFarrowings,
          animalTypeId: animalTypeId,
        },
        _sum: {
          litter: true,
        },
      }),
      this.client.weaning.aggregate({
        where: {
          deletedAt: null,
          ...prismaWhereWeanings,
          animalTypeId: animalTypeId,
        },
        _sum: {
          litter: true,
        },
      }),
      this.client.animal.aggregate({
        where: {
          quantity: { not: 0 },
          deletedAt: null,
          ...prismaWhereAnimals,
          animalTypeId: animalTypeId,
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
          animal: { status: 'ACTIVE' },
          animalTypeId: animalTypeId,
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
          animal: { status: 'ACTIVE' },
          animalTypeId: animalTypeId,
          deletedAt: null,
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
          animal: { status: 'ACTIVE' },
          animalTypeId: animalTypeId,
          deletedAt: null,
        },
        _sum: {
          price: true,
          number: true,
        },
      }),
      this.client.sale.aggregate({
        where: {
          ...prismaWhereSales,
          animalTypeId: animalTypeId,
          deletedAt: null,
        },
        _sum: {
          price: true,
        },
      }),
      this.client.isolation.aggregate({
        where: {
          ...prismaWhereIsolations,
          animalTypeId: animalTypeId,
          deletedAt: null,
        },
        _sum: {
          number: true,
        },
      }),
      this.client.animal.count({
        where: {
          status: 'SOLD',
          productionPhase: 'GROWTH',
          animalTypeId: animalTypeId,
          deletedAt: null,
        },
      }),
      this.client.animal.count({
        where: {
          status: 'SOLD',
          gender: 'FEMALE',
          productionPhase: 'GESTATION',
          animalTypeId: animalTypeId,
          deletedAt: null,
        },
      }),
      this.client.animal.count({
        where: {
          status: 'SOLD',
          productionPhase: 'FATTENING',
          animalTypeId: animalTypeId,
          deletedAt: null,
        },
      }),
      this.client.animal.count({
        where: {
          status: 'SOLD',
          gender: 'FEMALE',
          productionPhase: 'REPRODUCTION',
          animalTypeId: animalTypeId,
          deletedAt: null,
        },
      }),
      this.client.animal.count({
        where: {
          status: 'SOLD',
          gender: 'MALE',
          productionPhase: 'REPRODUCTION',
          animalTypeId: animalTypeId,
          deletedAt: null,
        },
      }),
      this.client.animal.count({
        where: {
          status: 'SOLD',
          gender: 'FEMALE',
          productionPhase: 'REPRODUCTION',
          animalTypeId: animalTypeId,
          deletedAt: null,
        },
      }),
      this.client.animal.count({
        where: {
          status: 'SOLD',
          gender: 'MALE',
          productionPhase: 'REPRODUCTION',
          animalTypeId: animalTypeId,
          deletedAt: null,
        },
      }),
      this.client.animal.count({
        where: {
          status: 'DEAD',
          productionPhase: 'GROWTH',
          animalTypeId: animalTypeId,
          deletedAt: null,
        },
      }),
      this.client.animal.count({
        where: {
          status: 'DEAD',
          productionPhase: 'FATTENING',
          animalTypeId: animalTypeId,
          deletedAt: null,
        },
      }),
      this.client.treatment.count({
        where: {
          ...prismaWhereTreatments,
          animalTypeId: animalTypeId,
          deletedAt: null,
        },
      }),
      this.client.breeding.count({
        where: {
          ...prismaWhereBreedings,
          animalTypeId: animalTypeId,
          deletedAt: null,
        },
      }),
      this.client.breeding.count({
        where: {
          result: 'PREGNANT',
          ...prismaWhereBreedings,
          animalTypeId: animalTypeId,
          deletedAt: null,
        },
      }),
    ]);

    const averageWeight =
      totalSumAnimals?._sum?.weight / Number(totalSumAnimals?._count?.id);

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
      sumAnimalGrowthSale,
      sumFemaleGestationSold,
      sumAnimalFatteningSold,
      sumFemaleReproductionSold,
      sumMaleReproductionSold,
      sumAnimalGrowthDead,
      sumAnimalFatteningDead,
      sumTreatments,
      totalBreedings,
      totalPositiveBreedings,
    };
  }
}
