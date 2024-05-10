import { Injectable } from '@nestjs/common';
import { Currency, Prisma } from '@prisma/client';
import { DatabaseService } from '../../app/database/database.service';
import {
  withPagination,
  WithPaginationResponse,
} from '../../app/utils/pagination';
import {
  CreateCurrenciesOptions,
  currenciesSelect,
  GetCurrencySelections,
  GetOneCurrencySelections,
  UpdateCurrenciesOptions,
  UpdateCurrenciesSelections,
} from './currency.type';

@Injectable()
export class CurrenciesService {
  constructor(private readonly client: DatabaseService) {}

  async findAll(
    selections: GetCurrencySelections,
  ): Promise<WithPaginationResponse | null> {
    const prismaWhere = {} as Prisma.CurrencyWhereInput;
    const { search, pagination } = selections;

    if (search) {
      Object.assign(prismaWhere, {
        OR: [
          {
            name: { contains: search, mode: 'insensitive' },
            code: { contains: search, mode: 'insensitive' },
            symbol: { contains: search, mode: 'insensitive' },
          },
        ],
      });
    }

    const currencies = await this.client.currency.findMany({
      where: { ...prismaWhere, deletedAt: null },
      take: pagination.take,
      skip: pagination.skip,
      select: currenciesSelect,
      orderBy: pagination.orderBy,
    });
    const rowCount = await this.client.currency.count({
      where: { ...prismaWhere, deletedAt: null },
    });

    return withPagination({
      pagination,
      rowCount,
      value: currencies,
    });
  }

  /** Find one currency in database. */
  async findOneBy(selections: GetOneCurrencySelections) {
    const prismaWhere = {} as Prisma.CurrencyWhereInput;
    const { currencyId, organizationId, status } = selections;

    if (currencyId) {
      Object.assign(prismaWhere, { id: currencyId });
    }

    if (organizationId) {
      Object.assign(prismaWhere, { organizationId });
    }

    if (status) {
      Object.assign(prismaWhere, { status });
    }

    const currency = await this.client.currency.findFirst({
      where: { ...prismaWhere, deletedAt: null },
      select: currenciesSelect,
    });

    return currency;
  }

  /** Create one currency in database. */
  async createOne(options: CreateCurrenciesOptions): Promise<Currency> {
    const { code, name, symbol } = options;

    const currency = this.client.currency.create({
      data: { code, name, symbol },
    });

    return currency;
  }

  /** Update one currency in database. */
  async updateOne(
    selections: UpdateCurrenciesSelections,
    options: UpdateCurrenciesOptions,
  ): Promise<Currency> {
    const { currencyId } = selections;
    const { code, name, symbol, status, deletedAt } = options;

    const currency = this.client.currency.update({
      where: { id: currencyId },
      data: { code, name, symbol, status, deletedAt },
    });

    return currency;
  }
}
