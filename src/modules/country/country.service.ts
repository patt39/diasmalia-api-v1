import { Injectable } from '@nestjs/common';
import { Country, Prisma } from '@prisma/client';
import { DatabaseService } from '../../app/database/database.service';
import {
  withPagination,
  WithPaginationResponse,
} from '../../app/utils/pagination';
import {
  countriesSelect,
  GetCountriesSelections,
  GetOneCountrySelections,
  UpdateCountriesOptions,
  UpdateCountriesSelections,
} from './country.type';

@Injectable()
export class CountriesService {
  constructor(private readonly client: DatabaseService) {}

  async findAll(
    selections: GetCountriesSelections,
  ): Promise<WithPaginationResponse | null> {
    const prismaWhere = {} as Prisma.CountryWhereInput;
    const { search, pagination, status } = selections;

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

    if (status) {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      status === 'true'
        ? Object.assign(prismaWhere, { status: true })
        : Object.assign(prismaWhere, { status: false });
    }

    const countries = await this.client.country.findMany({
      where: { ...prismaWhere, deletedAt: null },
      take: pagination.take,
      skip: pagination.skip,
      select: countriesSelect,
      orderBy: pagination.orderBy,
    });
    const rowCount = await this.client.country.count({
      where: { ...prismaWhere, deletedAt: null },
    });

    return withPagination({
      pagination,
      rowCount,
      value: countries,
    });
  }

  /** Find one currency in database. */
  async findOneBy(selections: GetOneCountrySelections) {
    const prismaWhere = {} as Prisma.CountryWhereInput;
    const { countryId, status, code } = selections;

    if (countryId) {
      Object.assign(prismaWhere, { id: countryId });
    }

    if (code) {
      Object.assign(prismaWhere, { code });
    }

    if (status) {
      Object.assign(prismaWhere, { status });
    }

    const country = await this.client.country.findFirst({
      where: { ...prismaWhere, deletedAt: null },
      select: countriesSelect,
    });

    return country;
  }

  // /** Create one currency in database. */
  // async createOne(options: CreateCurrenciesOptions): Promise<Currency> {
  //   const { code, name, symbol } = options;

  //   const currency = this.client.currency.create({
  //     data: { code, name, symbol },
  //   });

  //   return currency;
  // }

  /** Update one currency in database. */
  async updateOne(
    selections: UpdateCountriesSelections,
    options: UpdateCountriesOptions,
  ): Promise<Country> {
    const { countryId } = selections;
    const { code, name, status, deletedAt } = options;

    const country = this.client.country.update({
      where: { id: countryId },
      data: { code, name, status, deletedAt },
    });

    return country;
  }
}
