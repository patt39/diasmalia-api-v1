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
  dateTimeNowUtc,
  lastDayMonth,
  substrateDaysToTimeNowUtcDate,
} from '../../app/utils/commons';
import {
  WithPaginationResponse,
  withPagination,
} from '../../app/utils/pagination';
import { AssignTypesService } from '../assigne-type/assigne-type.service';
import { groupCountSalesAnalyticsByDateAndReturnArray } from './sales.analytics.utils';
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
  constructor(
    private readonly client: DatabaseService,
    private readonly assignTypesService: AssignTypesService,
  ) {}

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

    const salesContract = await this.client.sale.count({
      where: { ...prismaWhere, method: 'CONTRACT', deletedAt: null },
    });

    return withPagination({
      pagination,
      rowCount,
      salesContract,
      value: sales,
    });
  }

  /** Get chickens sales analytics. */
  async getChikenSalesAnalytics(selections: GetSalesSelections) {
    const prismaWhere = {} as Prisma.SaleWhereInput;
    const { animalTypeId, periode, months, year, organizationId } = selections;

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

    if (year) {
      Object.assign(prismaWhere, {
        createdAt: {
          gte: new Date(`${Number(year)}-01-01`),
          lte: new Date(`${Number(year) + 1}-01-01`),
        },
      });
      if (months) {
        Object.assign(prismaWhere, {
          createdAt: {
            gte: new Date(`${year}-${months}-01`),
            lte: lastDayMonth({
              year: Number(year),
              month: Number(months),
            }),
          },
        });
      }
    }

    if (organizationId) {
      Object.assign(prismaWhere, { organizationId });
    }

    const groupChickensAnalytics = await this.client.sale.groupBy({
      by: ['createdAt', 'organizationId', 'animalTypeId'],
      where: {
        ...prismaWhere,
        deletedAt: null,
        detail: 'CHICKENS',
        animal: { status: 'ACTIVE', deletedAt: null },
      },
      _sum: {
        price: true,
      },
      _count: true,
    });

    const chickensAnalytics = groupCountSalesAnalyticsByDateAndReturnArray({
      data: groupChickensAnalytics,
      year: year,
      month: months,
    });

    return chickensAnalytics;
  }

  /** Get chicks sale analytics. */
  async getChickSalesAnalytics(selections: GetSalesSelections) {
    const prismaWhere = {} as Prisma.SaleWhereInput;
    const { animalTypeId, periode, months, year, organizationId } = selections;

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

    if (year) {
      Object.assign(prismaWhere, {
        createdAt: {
          gte: new Date(`${Number(year)}-01-01`),
          lte: new Date(`${Number(year) + 1}-01-01`),
        },
      });
      if (months) {
        Object.assign(prismaWhere, {
          createdAt: {
            gte: new Date(`${year}-${months}-01`),
            lte: lastDayMonth({
              year: Number(year),
              month: Number(months),
            }),
          },
        });
      }
    }

    if (organizationId) {
      Object.assign(prismaWhere, { organizationId });
    }

    const groupChicksAnalytics = await this.client.sale.groupBy({
      by: ['createdAt', 'organizationId', 'animalTypeId'],
      where: {
        ...prismaWhere,
        deletedAt: null,
        detail: 'CHICKS',
        animal: { status: 'ACTIVE', deletedAt: null },
      },
      _sum: {
        price: true,
      },
      _count: true,
    });

    const chicksAnalytics = groupCountSalesAnalyticsByDateAndReturnArray({
      data: groupChicksAnalytics,
      year: year,
      month: months,
    });

    return chicksAnalytics;
  }

  /** Get eggs analytics. */
  async getEggSalesAnalytics(selections: GetSalesSelections) {
    const prismaWhere = {} as Prisma.SaleWhereInput;
    const { animalTypeId, periode, months, year, organizationId } = selections;

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

    if (year) {
      Object.assign(prismaWhere, {
        createdAt: {
          gte: new Date(`${Number(year)}-01-01`),
          lte: new Date(`${Number(year) + 1}-01-01`),
        },
      });
      if (months) {
        Object.assign(prismaWhere, {
          createdAt: {
            gte: new Date(`${year}-${months}-01`),
            lte: lastDayMonth({
              year: Number(year),
              month: Number(months),
            }),
          },
        });
      }
    }

    if (organizationId) {
      Object.assign(prismaWhere, { organizationId });
    }

    const groupEggsAnalytics = await this.client.sale.groupBy({
      by: ['createdAt', 'organizationId', 'animalTypeId'],
      where: {
        ...prismaWhere,
        deletedAt: null,
        detail: 'EGGS',
        animal: { status: 'ACTIVE', deletedAt: null },
      },
      _sum: {
        price: true,
      },
      _count: true,
    });

    const eggsAnalytics = groupCountSalesAnalyticsByDateAndReturnArray({
      data: groupEggsAnalytics,
      year: year,
      month: months,
    });

    return eggsAnalytics;
  }

  /** Get animals sales analytics. */
  async getAnimalSalesAnalytics(selections: GetSalesSelections) {
    const prismaWhere = {} as Prisma.SaleWhereInput;
    const { animalTypeId, periode, months, year, organizationId } = selections;

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

    if (year) {
      Object.assign(prismaWhere, {
        createdAt: {
          gte: new Date(`${Number(year)}-01-01`),
          lte: new Date(`${Number(year) + 1}-01-01`),
        },
      });
      if (months) {
        Object.assign(prismaWhere, {
          createdAt: {
            gte: new Date(`${year}-${months}-01`),
            lte: lastDayMonth({
              year: Number(year),
              month: Number(months),
            }),
          },
        });
      }
    }

    if (organizationId) {
      Object.assign(prismaWhere, { organizationId });
    }

    const groupSalesAnalytics = await this.client.sale.groupBy({
      by: ['createdAt', 'organizationId', 'animalTypeId'],
      where: {
        ...prismaWhere,
        deletedAt: null,
        detail: null,
      },
      _sum: {
        price: true,
      },
      _count: true,
    });

    const salesAnalytics = groupCountSalesAnalyticsByDateAndReturnArray({
      data: groupSalesAnalytics,
      year: year,
      month: months,
    });

    return salesAnalytics;
  }

  /** Get sales analytics. */
  async getSalesAnalytics(selections: GetSalesSelections) {
    const prismaWhere = {} as Prisma.SaleWhereInput;
    const { animalTypeId, periode, months, year, organizationId } = selections;

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

    if (year) {
      Object.assign(prismaWhere, {
        createdAt: {
          gte: new Date(`${Number(year)}-01-01`),
          lte: new Date(`${Number(year) + 1}-01-01`),
        },
      });
      if (months) {
        Object.assign(prismaWhere, {
          createdAt: {
            gte: new Date(`${year}-${months}-01`),
            lte: lastDayMonth({
              year: Number(year),
              month: Number(months),
            }),
          },
        });
      }
    }

    if (organizationId) {
      Object.assign(prismaWhere, { organizationId });
    }

    const groupSalesAnalytics = await this.client.sale.groupBy({
      by: ['createdAt', 'organizationId', 'animalTypeId'],
      where: {
        ...prismaWhere,
        deletedAt: null,
      },
      _sum: {
        price: true,
      },
      _count: true,
    });

    const salesAnalytics = groupCountSalesAnalyticsByDateAndReturnArray({
      data: groupSalesAnalytics,
      year: year,
      month: months,
    });

    return salesAnalytics;
  }

  /** Find one sale in database. */
  async findOneBy(selections: GetOneSaleSelections) {
    const prismaWhere = {} as Prisma.SaleWhereInput;
    const { saleId, animalTypeId, organizationId } = selections;

    if (saleId) {
      Object.assign(prismaWhere, { id: saleId });
    }

    if (organizationId) {
      Object.assign(prismaWhere, { organizationId });
    }

    if (animalTypeId) {
      Object.assign(prismaWhere, { animalTypeId });
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
      detail,
      number,
      soldTo,
      method,
      address,
      salePdf,
      userCreatedId,
      deletedAt,
    } = options;

    const sale = this.client.sale.update({
      where: { id: saleId },
      data: {
        note,
        price,
        phone,
        detail,
        soldTo,
        method,
        number,
        address,
        salePdf,
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

  /** Get best sale channel. */
  async getBestSaleChannel({ animalTypeId }: { animalTypeId: string }) {
    const findOneAssignType = await this.assignTypesService.findOneBy({
      animalTypeId,
    });
    if (!findOneAssignType)
      throw new HttpException(
        `AnimalType not assigned please change`,
        HttpStatus.NOT_FOUND,
      );

    const [
      totalSaleFarm,
      totalSaleMarket,
      totalSaleSocialMedia,
      totalSaleAuction,
      totalSaleContract,
      totalSaleOther,
    ] = await this.client.$transaction([
      this.client.sale.aggregate({
        where: {
          method: 'FARM',
          animalTypeId: animalTypeId,
          deletedAt: null,
        },
        _sum: {
          price: true,
        },
      }),
      this.client.sale.aggregate({
        where: {
          method: 'MARKET',
          animalTypeId: animalTypeId,
          deletedAt: null,
        },
        _sum: {
          price: true,
        },
      }),
      this.client.sale.aggregate({
        where: {
          method: 'SOCIALMEDIA',
          animalTypeId: animalTypeId,
          deletedAt: null,
        },
        _sum: {
          price: true,
        },
      }),
      this.client.sale.aggregate({
        where: {
          method: 'AUCTION',
          animalTypeId: animalTypeId,
          deletedAt: null,
        },
        _sum: {
          price: true,
        },
      }),
      this.client.sale.aggregate({
        where: {
          method: 'CONTRACT',
          animalTypeId: animalTypeId,
          deletedAt: null,
        },
        _sum: {
          price: true,
        },
      }),
      this.client.sale.aggregate({
        where: {
          method: 'OTHER',
          animalTypeId: animalTypeId,
          deletedAt: null,
        },
        _sum: {
          price: true,
        },
      }),
    ]);

    return {
      Farm: totalSaleFarm?._sum?.price,
      Market: totalSaleMarket?._sum?.price,
      SocialMedia: totalSaleSocialMedia?._sum?.price,
      Auction: totalSaleAuction?._sum?.price,
      Contract: totalSaleContract?._sum?.price,
      Other: totalSaleOther?._sum?.price,
    };
  }
}
