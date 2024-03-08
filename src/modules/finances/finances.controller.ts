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
  Req,
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
import { CreateOrUpdateFinancesDto, GetFinancesByType } from './finances.dto';
import { FinancesService } from './finances.service';

@Controller('finances')
export class FinanceController {
  constructor(private readonly financeService: FinancesService) {}

  /** Get all finances */
  @Get(`/`)
  @UseGuards(UserAuthGuard)
  async findAll(
    @Res() res,
    @Req() req,
    @Query() requestPaginationDto: RequestPaginationDto,
    @Query() query: SearchQueryDto,
    @Query() queryFinances: GetFinancesByType,
  ) {
    const { user } = req;
    const { search } = query;
    const { type } = queryFinances;

    const { take, page, sort } = requestPaginationDto;
    const pagination: PaginationType = addPagination({ page, take, sort });

    const finances = await this.financeService.findAll({
      type,
      search,
      pagination,
      organizationId: user?.organizationId,
    });

    return reply({ res, results: finances });
  }
  /** Post one Finance */
  @Post(`/create`)
  @UseGuards(UserAuthGuard)
  async createOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateFinancesDto,
  ) {
    const { user } = req;
    const { date, note, amount, type, detail } = body;

    const finance = await this.financeService.createOne({
      date,
      type,
      note,
      detail,
      amount,
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
    });

    return reply({ res, results: finance });
  }

  /** Update one finance */
  @Put(`/:financeId/edit`)
  @UseGuards(UserAuthGuard)
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateFinancesDto,
    @Param('financeId', ParseUUIDPipe) financeId: string,
  ) {
    const { user } = req;
    const { date, note, amount, type, detail } = body;

    const findOneFinance = await this.financeService.findOneBy({
      financeId,
      organizationId: user?.organizationId,
    });
    if (!findOneFinance)
      throw new HttpException(
        `FinanceId: ${financeId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const finance = await this.financeService.updateOne(
      { financeId: findOneFinance?.id },
      {
        date,
        note,
        type,
        amount,
        detail,
        organizationId: user?.organizationId,
        userCreatedId: user?.id,
      },
    );

    return reply({ res, results: finance });
  }

  /** Get one finance */
  @Get(`/view/:slug`)
  @UseGuards(UserAuthGuard)
  async getOneByIdUser(@Res() res, @Req() req, @Param('slug') slug: string) {
    const { user } = req;

    const findOneFinance = await this.financeService.findOneBy({
      slug,
      organizationId: user?.organizationId,
    });
    if (!findOneFinance)
      throw new HttpException(
        `Slug: ${slug} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    return reply({ res, results: findOneFinance });
  }

  /** Delete one finance */
  @Delete(`/delete/:financeId`)
  @UseGuards(UserAuthGuard)
  async deleteOne(
    @Res() res,
    @Req() req,
    @Param('financeId', ParseUUIDPipe) financeId: string,
  ) {
    const { user } = req;

    const findOneFinance = await this.financeService.findOneBy({
      financeId,
      organizationId: user?.organizationId,
    });
    if (!findOneFinance)
      throw new HttpException(
        `FinanceId: ${financeId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const finance = await this.financeService.updateOne(
      { financeId: findOneFinance?.id },
      { deletedAt: new Date() },
    );

    return reply({ res, results: finance });
  }
}
