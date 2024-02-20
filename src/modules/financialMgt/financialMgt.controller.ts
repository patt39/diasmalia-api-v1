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
import { FinancialAccountService } from '../financialAccount/financialAccount.service';
import { FinancialDetailService } from '../financialDetails/financialDetails.service';
import { JwtAuthGuard } from '../users/middleware';
import { CreateOrUpdateFinancialMgtDto } from './financialMgt.dto';
import { FinancialMgtService } from './financialMgt.service';

@Controller('financialMgt')
export class FinancialMgtController {
  constructor(
    private readonly financialMgtService: FinancialMgtService,
    private readonly financialDetailService: FinancialDetailService,
    private readonly financialAccountService: FinancialAccountService,
  ) {}

  /** Get all financialMgt */
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

    const financialDetail = await this.financialMgtService.findAll({
      search,
      pagination,
      organizationId: user?.organizationId,
    });

    return reply({ res, results: financialDetail });
  }

  /** Create Account */
  @Post(`/account`)
  @UseGuards(JwtAuthGuard)
  async createOneAccount(@Res() res, @Req() req) {
    const { user } = req;

    const financialAccount = await this.financialAccountService.createOne({
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
    });

    return reply({ res, results: financialAccount });
  }

  /** Post one FinancialMgt */
  @Post(`/`)
  @UseGuards(JwtAuthGuard)
  async createOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateFinancialMgtDto,
  ) {
    const { user } = req;
    const { date, note, amount, type, financialDetailId } = body;

    const findOneFinancialDetail = await this.financialDetailService.findOneBy({
      financialDetailId,
      organizationId: user?.organizationId,
    });
    if (!findOneFinancialDetail)
      throw new HttpException(
        `${financialDetailId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const findAccount = await this.financialAccountService.findOneBy({
      organizationId: user?.organizationId,
    });
    if (!findAccount)
      throw new HttpException(
        `Account doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const financialMgt = await this.financialMgtService.createOne({
      date,
      type,
      note,
      amount,
      financialAccountId: findAccount.id,
      financialDetailId: findOneFinancialDetail.id,
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
    });

    if (financialMgt.type === 'EXPENSE')
      await this.financialAccountService.updateOne(
        { financialAccountId: findAccount.id },
        {
          expenditureAmount: financialMgt.amount,
        },
      );

    if (financialMgt.type === 'INCOME')
      await this.financialAccountService.updateOne(
        { financialAccountId: findAccount.id },
        {
          incomeAmount: financialMgt.amount,
        },
      );

    return reply({ res, results: financialMgt });
  }

  /** Post one financialMgt */
  @Put(`/:financialMgtId`)
  @UseGuards(JwtAuthGuard)
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateFinancialMgtDto,
    @Param('financialMgtId', ParseUUIDPipe) financialMgtId: string,
  ) {
    const { user } = req;
    const { date, note, amount, type, financialDetailId } = body;

    const findOneFinancialMgt = await this.financialMgtService.findOneBy({
      financialMgtId,
      organizationId: user?.organizationId,
    });
    if (!findOneFinancialMgt)
      throw new HttpException(
        `${financialMgtId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneFinancialDetail = await this.financialDetailService.findOneBy({
      financialDetailId,
      organizationId: user?.organizationId,
    });
    if (!findOneFinancialDetail)
      throw new HttpException(
        `${financialDetailId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const financialMgt = await this.financialMgtService.updateOne(
      { financialMgtId: findOneFinancialMgt?.id },
      {
        date,
        note,
        type,
        amount,
        //financialAccountId,
        financialDetailId: findOneFinancialDetail.id,
        organizationId: user?.organizationId,
        userCreatedId: user?.id,
      },
    );

    return reply({ res, results: financialMgt });
  }

  /** Get one financialMgt */
  @Get(`/view`)
  @UseGuards(JwtAuthGuard)
  async getOneByIdUser(
    @Res() res,
    @Req() req,
    @Query('financialMgtId', ParseUUIDPipe) financialMgtId: string,
  ) {
    const { user } = req;

    const findOneFinancialMgt = await this.financialMgtService.findOneBy({
      financialMgtId,
      organizationId: user?.organizationId,
    });
    if (!findOneFinancialMgt)
      throw new HttpException(
        `${financialMgtId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    return reply({ res, results: findOneFinancialMgt });
  }

  /** Delete one financialMgt */
  @Delete(`/delete/:financialMgtId`)
  @UseGuards(JwtAuthGuard)
  async deleteOne(
    @Res() res,
    @Req() req,
    @Param('financialMgtId', ParseUUIDPipe) financialMgtId: string,
  ) {
    const { user } = req;

    const findOneFinancialMgt = await this.financialMgtService.findOneBy({
      financialMgtId,
      organizationId: user?.organizationId,
    });
    if (!findOneFinancialMgt)
      throw new HttpException(
        `${financialMgtId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const financialMgt = await this.financialMgtService.updateOne(
      { financialMgtId: findOneFinancialMgt.id },
      { deletedAt: new Date() },
    );

    return reply({ res, results: financialMgt });
  }
}
