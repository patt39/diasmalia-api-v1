import { HttpException, HttpStatus, Injectable, Res } from '@nestjs/common';
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
    const { search, method, organizationId, pagination } = selections;

    if (search) {
      Object.assign(prismaWhere, {
        OR: [
          {
            code: { contains: search, mode: 'insensitive' },
          },
        ],
      });
    }

    if (organizationId) {
      Object.assign(prismaWhere, { organizationId });
    }

    if (method) {
      Object.assign(prismaWhere, { method });
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
      date,
      note,
      type,
      price,
      soldTo,
      method,
      address,
      phone,
      email,
      quantity,
      batchId,
      organizationId,
      userCreatedId,
    } = options;

    const sale = this.client.sale.create({
      data: {
        date,
        note,
        price,
        type,
        soldTo,
        method,
        address,
        phone,
        email,
        quantity,
        batchId,
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
      price,
      email,
      type,
      soldTo,
      method,
      address,
      phone,
      quantity,
      batchId,
      organizationId,
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
        soldTo,
        method,
        address,
        email,
        phone,
        quantity,
        batchId,
        organizationId,
        userCreatedId,
        deletedAt,
      },
    });

    return sale;
  }

  async downloadToExcel(@Res() res) {
    const prismaWhere = {} as Prisma.SaleWhereInput;

    const sales = await this.client.sale.findMany({
      where: { ...prismaWhere, deletedAt: null },
    });

    if (!sales) throw new HttpException(`Sales empty`, HttpStatus.NOT_FOUND);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sales sheet');
    worksheet.state = 'visible';

    worksheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Animal Code', key: 'animals', width: 12 },
      { header: 'Phone number', key: 'phone', width: 40 },
      { header: 'Price', key: 'price', width: 20 },
      { header: 'Sold to', key: 'soldTo', width: 20 },
      { header: 'Method', key: 'method', width: 20 },
      { header: 'Email', key: 'email', width: 40 },
      { header: 'Status', key: 'status', width: 10 },
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
        phone: sale.phone,
        price: sale.price,
        soldTo: sale.soldTo,
        method: sale.method,
        email: sale.email,
      });
    }

    workbook.xlsx.write(res);

    workbook.creator = 'me';
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
