import { Injectable, Res } from '@nestjs/common';
import { Animal, Prisma } from '@prisma/client';
import * as exceljs from 'exceljs';
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
      search,
      status,
      gender,
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
          { codeFather: { contains: search, mode: 'insensitive' } },
          { electronicCode: { contains: search, mode: 'insensitive' } },
          { codeMother: { contains: search, mode: 'insensitive' } },
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

    if (isCastrated === 'FALSE') {
      Object.assign(prismaWhere, {
        castration: null,
      });
    }

    if (isIsolated === 'FALSE') {
      Object.assign(prismaWhere, {
        isolations: { none: {} },
      });
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
      photo,
      weight,
      gender,
      status,
      breedId,
      birthday,
      quantity,
      codeFather,
      codeMother,
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
        weight,
        gender,
        status,
        breedId,
        birthday,
        quantity,
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
}
