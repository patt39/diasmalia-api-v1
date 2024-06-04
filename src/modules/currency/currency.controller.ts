import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { reply } from '../../app/utils/reply';

import { RequestPaginationDto } from '../../app/utils/pagination/request-pagination.dto';
import {
  addPagination,
  PaginationType,
} from '../../app/utils/pagination/with-pagination';
import { SearchQueryDto } from '../../app/utils/search-query/search-query.dto';
import { UserAuthGuard } from '../users/middleware';
import { CreateOrUpdateCurrenciesDto } from './currency.dto';
import { CurrenciesService } from './currency.service';

@Controller('currencies')
export class CurrenciesController {
  constructor(private readonly currenciesService: CurrenciesService) {}

  /** Get all Currencies */
  @Get(`/`)
  @UseGuards(UserAuthGuard)
  async findAll(
    @Res() res,
    @Query() requestPaginationDto: RequestPaginationDto,
    @Query() searchQuery: SearchQueryDto,
  ) {
    const { search } = searchQuery;

    const { take, page, sort, sortBy } = requestPaginationDto;
    const pagination: PaginationType = addPagination({
      page,
      take,
      sort,
      sortBy,
    });

    const currencies = await this.currenciesService.findAll({
      search,
      pagination,
    });

    return reply({ res, results: currencies });
  }

  /** Post one currency */
  @Post(`/`)
  @UseGuards(UserAuthGuard)
  async createOne(
    @Res() res,
    @Body() createOrUpdateContactUsDto: CreateOrUpdateCurrenciesDto,
  ) {
    const { code, name, symbol } = createOrUpdateContactUsDto;

    const currency = await this.currenciesService.createOne({
      code,
      name,
      symbol,
    });

    return reply({ res, results: currency });
  }

  /** Enable status currency */
  @Put(`/:currencyId/change-status`)
  @UseGuards(UserAuthGuard)
  async enableCurrency(
    @Res() res,
    @Param('currencyId', ParseUUIDPipe) currencyId: string,
  ) {
    const findCurrency = await this.currenciesService.findOneBy({
      currencyId,
    });
    if (!findCurrency)
      throw new HttpException(
        `CurrencyId: ${currencyId} doesn't exists, please change`,
        HttpStatus.NOT_FOUND,
      );

    await this.currenciesService.updateOne(
      { currencyId: findCurrency.id },
      { status: !findCurrency.status },
    );

    return reply({ res, results: 'Status updated successfully' });
  }

  /** Get one Currency */
  @Get(`/show/:currencyId`)
  @UseGuards(UserAuthGuard)
  async getOneByCurrencyId(
    @Res() res,
    @Param('currencyId', ParseUUIDPipe) currencyId: string,
  ) {
    const currency = await this.currenciesService.findOneBy({ currencyId });

    return reply({ res, results: currency });
  }

  /** Delete one currency */
  @Delete(`/delete/:currencyId`)
  @UseGuards(UserAuthGuard)
  async deleteOne(
    @Res() res,
    @Param('currencyId', ParseUUIDPipe) currencyId: string,
  ) {
    const currency = await this.currenciesService.updateOne(
      { currencyId },
      { deletedAt: new Date() },
    );

    return reply({ res, results: currency });
  }
}
