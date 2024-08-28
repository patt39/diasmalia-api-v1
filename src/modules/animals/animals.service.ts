import { HttpException, HttpStatus, Injectable, Res } from '@nestjs/common';
import { Animal, Prisma } from '@prisma/client';
import * as exceljs from 'exceljs';
import { DatabaseService } from '../../app/database/database.service';
import {
  WithPaginationResponse,
  withPagination,
} from '../../app/utils/pagination';
import { AssignTypesService } from '../assigne-type/assigne-type.service';
import { GetOneBreedingsSelections } from '../breedings/breedings.type';
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
        OR: [
          { code: { contains: search, mode: 'insensitive' } },
          { electronicCode: { contains: search, mode: 'insensitive' } },
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
      electronicCode,
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

    if (electronicCode) {
      Object.assign(prismaWhere, { electronicCode });
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
    selections: GetOneBreedingsSelections,
  ): Promise<any> {
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

    const animal = await this.client.animal.findFirst({
      where: {
        ...prismaWhereAnimal,
        deletedAt: null,
        organizationId,
      },
      select: AnimalSelect,
    });

    const breedingCount = await this.client.breeding.count({
      where: { animalMaleId: animal.id, deletedAt: null, organizationId },
    });

    const saleChicken = await this.client.sale.findMany({
      where: {
        animalId: animal?.id,
        detail: 'CHICKENS',
        deletedAt: null,
        organizationId,
        animalTypeId: animal.animalTypeId,
      },
    });

    const saleEgg = await this.client.sale.findMany({
      where: {
        animalId: animal.id,
        detail: 'EGGS',
        deletedAt: null,
        organizationId,
      },
    });

    const saleChick = await this.client.sale.findMany({
      where: {
        animalId: animal.id,
        detail: 'CHICKS',
        deletedAt: null,
        organizationId,
      },
    });

    const sumEggIncubated = await this.client.incubation.findMany({
      where: {
        deletedAt: null,
        organizationId,
        animalTypeId: animal.animalTypeId,
      },
    });

    const sumDeaths = await this.client.death.findMany({
      where: {
        deletedAt: null,
        organizationId,
        animalTypeId: animal.animalTypeId,
      },
    });

    const sumFeedings = await this.client.feeding.findMany({
      where: {
        deletedAt: null,
        organizationId,
        animalTypeId: animal.animalTypeId,
      },
    });
    const sumIsolations = await this.client.isolation.findMany({
      where: {
        deletedAt: null,
        organizationId,
        animalTypeId: animal.animalTypeId,
      },
    });
    const sumEggHarvestings = await this.client.eggHavesting.findMany({
      where: {
        deletedAt: null,
        organizationId,
        animalTypeId: animal.animalTypeId,
      },
    });
    const sumFarrowings = await this.client.farrowing.findMany({
      where: {
        deletedAt: null,
        organizationId,
        animalTypeId: animal.animalTypeId,
      },
    });
    const sumWeanings = await this.client.weaning.findMany({
      where: {
        deletedAt: null,
        organizationId,
        animalTypeId: animal.animalTypeId,
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
      farrowinglitterCount,
      weaninglitterCount,
    };
  }

  /** Find one Animal in database. */
  async findOneByCode(selections: GetOneAnimalsSelections) {
    const { code } = selections;

    const animal = await this.client.animal.findFirst({
      select: AnimalSelect,
      where: {
        code: code,
      },
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
      electronicCode,
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
      electronicCode,
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
        electronicCode,
        locationId,
        deletedAt,
      },
    });

    return animal;
  }

  /** Generate excel template to load data. */
  async downloadExcelTemplate(@Res() res) {
    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet('Bulk create animals');
    worksheet.state = 'visible';

    worksheet.columns = [
      { header: 'Code', key: 'code', width: 15 },
      { header: 'Father Code', key: 'codeFather', width: 12 },
      { header: 'Mother Code', key: 'codeMother', width: 40 },
      { header: 'Gender', key: 'gender', width: 40 },
      { header: 'Weight', key: 'weight', width: 40 },
      { header: 'Electronic Code', key: 'electronicCode', width: 10 },
      { header: 'Birthday', key: 'birthday', width: 20 },
      { header: 'Type', key: 'type', width: 20 },
      { header: 'Production Phase', key: 'productionPhase', width: 20 },
    ];

    worksheet.getRow(1).height = 20;
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      bgColor: { argb: '000000' },
      fgColor: { argb: '000000' },
    };
    worksheet.getRow(1).font = {
      size: 11.5,
      bold: true,
      color: { argb: 'FFFFFF' },
    };

    worksheet.getRow(1).alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true,
    };

    worksheet.getRow(1).border = {
      top: { style: 'thin', color: { argb: '000000' } },
      bottom: { style: 'thin', color: { argb: '000000' } },
      left: { style: 'thin', color: { argb: 'FFFFFF' } },
      right: { style: 'thin', color: { argb: 'FFFFFF' } },
    };

    workbook.xlsx.write(res);

    workbook.creator = 'me';
    workbook.created = new Date();
    workbook.modified = new Date();
    workbook.lastPrinted = new Date();
  }

  /** Load data to database. */
  async uploadDataFromExcel(filePath: string): Promise<string> {
    // Load Excel workbook
    const workbook = new exceljs.Workbook();
    await workbook.xlsx.readFile(filePath);

    // Extract data from Excel worksheet
    const worksheet = workbook.getWorksheet(1); // Assuming data is on the first worksheet
    const data: Animal[] = [];
    worksheet.eachRow({ includeEmpty: true }, (row) => {
      // Assuming data starts from the second row
      if (row.number !== 0) {
        const animal: Animal = {
          // code: row.getCell(1).value,
          // codeFather: row.getCell(2).value,
          // codeMother: row.getCell(3).value,
          // gender: row.getCell(4).value,
          // weight: row.getCell(5).value,
          // electronicCode: row.getCell(6).value,
          // type: row.getCell(7).value,
          // productionPhase: row.getCell(8).value,
          // birthday: row.getCell(9).value,
        } as Animal;

        data.push(animal);
      }
    });

    // Save data to PostgreSQL database using Prisma
    await this.client.animal.createMany({ data });
    return 'Bulk animals created';
  }

  /** Load data to database. */
  async getAnimalTransactions(animalTypeId: any) {
    const findOneAssignType = await this.assignTypesService.findOneBy({
      animalTypeId,
    });
    if (!findOneAssignType)
      throw new HttpException(
        `AnimalType not assigned please change`,
        HttpStatus.NOT_FOUND,
      );
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
      sumAnimalGrowthSale,
      sumFemaleGestationSold,
      sumAnimalFatteningSold,
      sumFemaleReproductionSold,
      sumMaleReproductionSold,
      sumAnimalGrowthDead,
      sumAnimalFatteningDead,
      sumTreatments,
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
      this.client.farrowing.findMany({
        where: {
          deletedAt: null,
          animalTypeId: animalTypeId,
        },
      }),
      this.client.weaning.findMany({
        where: {
          deletedAt: null,
          animalTypeId: animalTypeId,
        },
      }),
      this.client.animal.findMany({
        where: {
          deletedAt: null,
          animalTypeId: animalTypeId,
        },
      }),
      this.client.eggHavesting.findMany({
        where: {
          deletedAt: null,
          animalTypeId: animalTypeId,
        },
      }),
      this.client.death.findMany({
        where: {
          deletedAt: null,
          animalTypeId: animalTypeId,
        },
      }),
      this.client.feeding.findMany({
        where: {
          deletedAt: null,
          animalTypeId: animalTypeId,
        },
      }),
      this.client.incubation.findMany({
        where: {
          deletedAt: null,
          animalTypeId: animalTypeId,
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
          status: 'SOLD',
          productionPhase: 'FATTENING',
          animalTypeId: animalTypeId,
          deletedAt: null,
        },
      }),
      this.client.treatment.count({
        where: {
          animalTypeId: animalTypeId,
          deletedAt: null,
        },
      }),
    ]);
    const initialValue = 0;
    const sumFarrowings = totalFarrowings?.reduce(
      (accumulator: any, currentValue: any) =>
        accumulator + currentValue.litter,
      initialValue,
    );

    const sumWeanings = totalWeanings?.reduce(
      (accumulator: any, currentValue: any) =>
        accumulator + currentValue.litter,
      initialValue,
    );

    const sumAnimalsQuantity = totalSumAnimals?.reduce(
      (accumulator: any, currentValue: any) =>
        accumulator + currentValue.quantity,
      initialValue,
    );

    const sumFemaleAnimals = totalSumAnimals?.reduce(
      (accumulator: any, currentValue: any) =>
        accumulator + currentValue.female,
      initialValue,
    );

    const sumMaleAnimals = totalSumAnimals?.reduce(
      (accumulator: any, currentValue: any) => accumulator + currentValue.male,
      initialValue,
    );

    const sumWeightAnimals = totalSumAnimals?.reduce(
      (accumulator: any, currentValue: any) =>
        accumulator + currentValue.weight,
      initialValue,
    );

    const averageWeight = sumWeightAnimals / Number(totalSumAnimals?.length);

    const sumEggHarvested = totalEggHarvested?.reduce(
      (accumulator: any, currentValue: any) =>
        accumulator + currentValue.quantity,
      initialValue,
    );

    const sumDeaths = totalDeaths?.reduce(
      (accumulator: any, currentValue: any) =>
        accumulator + currentValue.number,
      initialValue,
    );

    const sumFeedings = totalFeedings.reduce(
      (accumulator: any, currentValue: any) =>
        accumulator + currentValue.quantity,
      initialValue,
    );

    const sumIncubations = totalIncubations.reduce(
      (accumulator: any, currentValue: any) =>
        accumulator + currentValue.quantityStart,
      initialValue,
    );

    const sumHatched = totalIncubations.reduce(
      (accumulator: any, currentValue: any) =>
        accumulator + currentValue.quantityEnd,
      initialValue,
    );

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
      sumFarrowings,
      sumWeanings,
      sumAnimalsQuantity,
      sumFemaleAnimals,
      sumMaleAnimals,
      averageWeight,
      sumEggHarvested,
      sumDeaths,
      sumFeedings,
      sumIncubations,
      sumHatched,
      sumAnimalGrowthSale,
      sumFemaleGestationSold,
      sumAnimalFatteningSold,
      sumFemaleReproductionSold,
      sumMaleReproductionSold,
      sumAnimalGrowthDead,
      sumAnimalFatteningDead,
      sumTreatments,
    };
  }
}
