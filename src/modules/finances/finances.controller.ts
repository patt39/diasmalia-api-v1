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
import { AccountService } from '../account/account.service';
import { JwtAuthGuard } from '../users/middleware';
import { CreateOrUpdateFinancesDto } from './finances.dto';
import { FinancesService } from './finances.service';

@Controller('financialMgt')
export class FinanceController {
  constructor(
    private readonly financeService: FinancesService,
    private readonly accountService: AccountService,
  ) {}

  /** Get all finance */
  @Get(`/`)
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Res() res,
    @Req() req,
    @Query() requestPaginationDto: RequestPaginationDto,
    @Query() query: SearchQueryDto,
  ) {
    const { user } = req;
    const { search } = query;

    const { take, page, sort } = requestPaginationDto;
    const pagination: PaginationType = addPagination({ page, take, sort });

    const finances = await this.financeService.findAll({
      search,
      pagination,
      organizationId: user?.organizationId,
    });

    return reply({ res, results: finances });
  }

  /** Create Account */
  @Post(`/account`)
  @UseGuards(JwtAuthGuard)
  async createOneAccount(@Res() res, @Req() req) {
    const { user } = req;

    const account = await this.accountService.createOne({
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
    });

    return reply({ res, results: account });
  }

  /** Post one Finance */
  @Post(`/`)
  @UseGuards(JwtAuthGuard)
  async createOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateFinancesDto,
  ) {
    const { user } = req;
    const { date, note, amount, type, details } = body;

    const findAccount = await this.accountService.findOneBy({
      organizationId: user?.organizationId,
    });
    if (!findAccount)
      throw new HttpException(
        `Account doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const financialMgt = await this.financeService.createOne({
      date,
      type,
      note,
      details,
      amount,
      accountId: findAccount.id,
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
    });

    if (financialMgt.type === 'EXPENSE')
      await this.accountService.updateOne(
        { accountId: findAccount.id },
        {
          expenditureAmount: financialMgt.amount,
        },
      );

    if (financialMgt.type === 'INCOME')
      await this.accountService.updateOne(
        { accountId: findAccount?.id },
        {
          incomeAmount: financialMgt?.amount,
        },
      );

    return reply({ res, results: financialMgt });
  }

  /** Post one financialMgt */
  @Put(`/:financeId`)
  @UseGuards(JwtAuthGuard)
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateFinancesDto,
    @Param('financeId', ParseUUIDPipe) financeId: string,
  ) {
    const { user } = req;
    const { date, note, amount, type, details } = body;

    const findOneFinance = await this.financeService.findOneBy({
      financeId,
      organizationId: user?.organizationId,
    });
    if (!findOneFinance)
      throw new HttpException(
        `${financeId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const finance = await this.financeService.updateOne(
      { financeId: findOneFinance?.id },
      {
        date,
        note,
        type,
        details,
        amount,
        //financialAccountId,
        organizationId: user?.organizationId,
        userCreatedId: user?.id,
      },
    );

    return reply({ res, results: finance });
  }

  /** Get one finance */
  @Get(`/view`)
  @UseGuards(JwtAuthGuard)
  async getOneByIdUser(
    @Res() res,
    @Req() req,
    @Query('financialMgtId', ParseUUIDPipe) financeId: string,
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

    return reply({ res, results: findOneFinance });
  }

  /** Delete one finance */
  @Delete(`/delete/:financeId`)
  @UseGuards(JwtAuthGuard)
  async deleteOne(
    @Res() res,
    @Req() req,
    @Param('financialMgtId', ParseUUIDPipe) financeId: string,
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
