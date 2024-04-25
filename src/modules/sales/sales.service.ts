import {
  HttpException,
  HttpStatus,
  Injectable,
  Req,
  Res,
} from '@nestjs/common';
import { Prisma, Sale } from '@prisma/client';
import * as ExcelJS from 'exceljs';
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
    const { search, method, type, organizationId, pagination } = selections;

    if (search) {
      Object.assign(prismaWhere, {
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { soldTo: { contains: search, mode: 'insensitive' } },
          { animalCode: { contains: search, mode: 'insensitive' } },
          { animalType: { name: { contains: search, mode: 'insensitive' } } },
        ],
      });
    }

    if (organizationId) {
      Object.assign(prismaWhere, { organizationId });
    }

    if (method) {
      Object.assign(prismaWhere, { method });
    }

    if (type) {
      Object.assign(prismaWhere, { type });
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
    const { saleId, animalId, organizationId } = selections;

    if (saleId) {
      Object.assign(prismaWhere, { id: saleId });
    }

    if (animalId) {
      Object.assign(prismaWhere, { animalId });
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
      date,
      note,
      type,
      price,
      phone,
      email,
      soldTo,
      method,
      address,
      animalId,
      quantity,
      animalCode,
      animalTypeId,
      organizationId,
      userCreatedId,
    } = options;

    const sale = this.client.sale.create({
      data: {
        date,
        note,
        type,
        price,
        phone,
        email,
        soldTo,
        method,
        address,
        animalId,
        quantity,
        animalCode,
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
      date,
      note,
      type,
      price,
      phone,
      soldTo,
      method,
      address,
      animalId,
      quantity,
      animalCode,
      userCreatedId,
      deletedAt,
    } = options;

    const sale = this.client.sale.update({
      where: {
        id: saleId,
      },
      data: {
        date,
        note,
        type,
        price,
        phone,
        soldTo,
        method,
        address,
        animalId,
        quantity,
        animalCode,
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
      { header: 'Animal Code', key: 'animalCode', width: 20 },
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
        date: sale.date,
        email: sale.email,
        phone: sale.phone,
        price: sale.price,
        soldTo: sale.soldTo,
        method: sale.method,
        address: sale.address,
        animalType: sale.type,
        animalCode: sale.animalCode,
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
}
