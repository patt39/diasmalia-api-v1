import {
  HttpException,
  HttpStatus,
  Injectable,
  Req,
  Res,
} from '@nestjs/common';
import { Prisma, Sale } from '@prisma/client';
import * as ExcelJS from 'exceljs';
import {
  dateTimeNowUtc,
  substrateDaysToTimeNowUtcDate,
} from 'src/app/utils/commons';
import { DatabaseService } from '../../app/database/database.service';
import {
  WithPaginationResponse,
  withPagination,
} from '../../app/utils/pagination';
import {
  CreateSalesOptions,
  GetOneSaleSelections,
  GetSalesSelections,
  SalesSelect,
  UpdateSalesOptions,
  UpdateSalesSelections,
} from './sales.type';
@Injectable()
export class SalesService {
  constructor(private readonly client: DatabaseService) {}

  async findAll(
    selections: GetSalesSelections,
  ): Promise<WithPaginationResponse | null> {
    const prismaWhere = {} as Prisma.SaleWhereInput;
    const {
      search,
      method,
      type,
      periode,
      detail,
      pagination,
      animalTypeId,
      organizationId,
    } = selections;

    if (search) {
      Object.assign(prismaWhere, {
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { soldTo: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    if (organizationId) {
      Object.assign(prismaWhere, { organizationId });
    }

    if (method) {
      Object.assign(prismaWhere, { method });
    }

    if (detail) {
      Object.assign(prismaWhere, { detail });
    }

    if (type) {
      Object.assign(prismaWhere, { type });
    }

    if (animalTypeId) {
      Object.assign(prismaWhere, { animalTypeId });
    }

    if (periode) {
      Object.assign(prismaWhere, {
        createdAt: {
          gte: substrateDaysToTimeNowUtcDate(Number(periode)),
          lte: dateTimeNowUtc(),
        },
      });
    }

    const sales = await this.client.sale.findMany({
      where: { ...prismaWhere, deletedAt: null },
      take: pagination.take,
      skip: pagination.skip,
      select: SalesSelect,
      orderBy: pagination.orderBy,
    });

    const rowCount = await this.client.sale.count({
      where: { ...prismaWhere, deletedAt: null },
    });

    return withPagination({
      pagination,
      rowCount,
      value: sales,
    });
  }

  /** Find one sale in database. */
  async findOneBy(selections: GetOneSaleSelections) {
    const prismaWhere = {} as Prisma.SaleWhereInput;
    const { saleId, organizationId } = selections;

    if (saleId) {
      Object.assign(prismaWhere, { id: saleId });
    }

    if (organizationId) {
      Object.assign(prismaWhere, { organizationId });
    }

    const sale = await this.client.sale.findFirst({
      where: { ...prismaWhere, deletedAt: null },
      select: SalesSelect,
    });

    return sale;
  }

  /** Create one sale in database. */
  async createOne(options: CreateSalesOptions): Promise<Sale> {
    const {
      note,
      code,
      type,
      male,
      female,
      price,
      phone,
      email,
      soldTo,
      detail,
      method,
      number,
      animals,
      address,
      animalId,
      animalTypeId,
      organizationId,
      userCreatedId,
    } = options;

    const sale = this.client.sale.create({
      data: {
        note,
        code,
        type,
        price,
        phone,
        email,
        male,
        female,
        soldTo,
        detail,
        method,
        number,
        address,
        animals,
        animalId,
        animalTypeId,
        organizationId,
        userCreatedId,
      },
    });

    return sale;
  }

  /** Update one sale in database. */
  async updateOne(
    selections: UpdateSalesSelections,
    options: UpdateSalesOptions,
  ): Promise<Sale> {
    const { saleId } = selections;
    const {
      note,
      price,
      phone,
      number,
      soldTo,
      method,
      address,
      userCreatedId,
      deletedAt,
    } = options;

    const sale = this.client.sale.update({
      where: { id: saleId },
      data: {
        note,
        price,
        phone,
        soldTo,
        method,
        number,
        address,
        userCreatedId,
        deletedAt,
      },
    });

    return sale;
  }

  async downloadToExcel(@Res() res, @Req() req) {
    const { user } = req;
    const prismaWhere = {} as Prisma.SaleWhereInput;

    const sales = await this.client.sale.findMany({
      where: { ...prismaWhere, deletedAt: null },
    });

    if (!sales) throw new HttpException(`Sales empty`, HttpStatus.NOT_FOUND);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sales sheet');
    worksheet.state = 'visible';

    worksheet.columns = [
      { header: 'Date', key: 'date', width: 12 },
      { header: 'Animals codes', key: 'animals', width: 20 },
      { header: 'Animal Type', key: 'type', width: 12 },
      { header: 'Price', key: 'price', width: 12 },
      { header: 'Sold to', key: 'soldTo', width: 40 },
      { header: 'Phone number', key: 'phone', width: 20 },
      { header: 'Email', key: 'email', width: 40 },
      { header: 'Address', key: 'address', width: 40 },
      { header: 'Method', key: 'method', width: 20 },
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

    for (const sale of sales) {
      worksheet.addRow({
        type: sale.type,
        email: sale.email,
        phone: sale.phone,
        price: sale.price,
        soldTo: sale.soldTo,
        method: sale.method,
        date: sale.createdAt,
        animals: sale.animals,
        address: sale.address,
      });
    }

    workbook.xlsx.write(res);

    workbook.creator = user.profile.firstName;
    workbook.created = new Date();
    workbook.modified = new Date();
    workbook.lastPrinted = new Date();

    // Force workbook calculation on load
    workbook.calcProperties.fullCalcOnLoad = true;

    workbook.views = [
      {
        x: 0,
        y: 0,
        width: 10000,
        height: 20000,
        firstSheet: 0,
        activeTab: 1,
        visibility: 'visible',
      },
    ];
  }

  async exportToExcel(@Res() res, @Req() req) {
    const { user } = req;
    const prismaWhere = {} as Prisma.SaleWhereInput;

    const sales = await this.client.sale.findMany({
      where: { ...prismaWhere, deletedAt: null },
    });

    if (!sales) throw new HttpException(`Sales empty`, HttpStatus.NOT_FOUND);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sales sheet');
    worksheet.state = 'visible';

    worksheet.columns = [
      { header: 'Date', key: 'date', width: 12 },
      { header: 'Animal Codes', key: 'animals', width: 20 },
      { header: 'Animal Type', key: 'type', width: 12 },
      { header: 'Price', key: 'price', width: 12 },
      { header: 'Sold to', key: 'soldTo', width: 40 },
      { header: 'Phone number', key: 'phone', width: 20 },
      { header: 'Email', key: 'email', width: 40 },
      { header: 'Address', key: 'address', width: 40 },
      { header: 'Method', key: 'method', width: 20 },
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

    for (const sale of sales) {
      worksheet.addRow({
        type: sale.type,
        email: sale.email,
        phone: sale.phone,
        price: sale.price,
        soldTo: sale.soldTo,
        method: sale.method,
        date: sale.createdAt,
        animals: sale.animals,
        address: sale.address,
      });
    }

    workbook.xlsx.write(res);

    workbook.creator = user.profile.firstName;
    workbook.created = new Date();
    workbook.modified = new Date();
    workbook.lastPrinted = new Date();

    // Force workbook calculation on load
    workbook.calcProperties.fullCalcOnLoad = true;

    workbook.views = [
      {
        x: 0,
        y: 0,
        width: 10000,
        height: 20000,
        firstSheet: 0,
        activeTab: 1,
        visibility: 'visible',
      },
    ];
  }

  /** Get sale transactiions. */
  async getSaleTransactions() {
    const [totalSaleChicks, totalSaleEggs, totalSaleChickens] =
      await this.client.$transaction([
        this.client.sale.findMany({
          where: { detail: 'CHICKS', deletedAt: null },
        }),
        this.client.sale.findMany({
          where: { detail: 'EGGS', deletedAt: null },
        }),
        this.client.sale.findMany({
          where: { detail: 'CHICKENS', deletedAt: null },
        }),
      ]);

    const initialValue = 0;
    const sumSaleChicks = totalSaleChicks.reduce(
      (accumulator: any, currentValue: any) =>
        accumulator + currentValue.number,
      initialValue,
    );

    const sumSaleEggs = totalSaleEggs.reduce(
      (accumulator: any, currentValue: any) =>
        accumulator + currentValue.number,
      initialValue,
    );

    const sumSaleChickens = totalSaleChickens.reduce(
      (accumulator: any, currentValue: any) =>
        accumulator + currentValue.number,
      initialValue,
    );

    return { sumSaleChicks, sumSaleEggs, sumSaleChickens };
  }
}
