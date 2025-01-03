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
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { AnimalsService } from '../animals/animals.service';
import { UserAuthGuard } from '../users/middleware';
import { CreateOrUpdateFinancesDto, GetFinancesByType } from './finances.dto';
import { FinancesService } from './finances.service';

@Controller('finances')
export class FinanceController {
  constructor(
    private readonly financeService: FinancesService,
    private readonly animalsService: AnimalsService,
    private readonly activitylogsService: ActivityLogsService,
  ) {}

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
    const { type, periode, animalId, animalTypeId } = queryFinances;

    const { take, page, sort, sortBy } = requestPaginationDto;
    const pagination: PaginationType = addPagination({
      page,
      take,
      sort,
      sortBy,
    });

    const finances = await this.financeService.findAll({
      type,
      search,
      animalId,
      pagination,
      animalTypeId,
      periode: Number(periode),
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
    const { amount, type, detail, code } = body;

    const findOneAnimal = await this.animalsService.findOneByCode({
      code,
      organizationId: user?.organizationId,
    });
    if (!findOneAnimal)
      throw new HttpException(
        `Code: ${code} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const finance = await this.financeService.createOne({
      type,
      detail,
      animalId: findOneAnimal.id,
      animalTypeId: findOneAnimal.animalTypeId,
      amount: type === 'EXPENSE' ? Number(-amount) : Number(amount),
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
    });

    await this.activitylogsService.createOne({
      userId: user?.id,
      organizationId: user?.organizationId,
      message: `${user?.profile?.firstName} ${user?.profile?.lastName} added a ${finance?.type} transaction in your organization`,
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
    const { amount, type, detail } = body;

    const findOneFinance = await this.financeService.findOneBy({
      financeId,
      organizationId: user.organizationId,
    });
    if (!findOneFinance)
      throw new HttpException(
        `FinanceId: ${financeId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const finance = await this.financeService.updateOne(
      { financeId: findOneFinance?.id },
      {
        type,
        detail,
        amount: type === 'EXPENSE' ? Number(-amount) : Number(amount),
      },
    );

    await this.activitylogsService.createOne({
      userId: user?.id,
      organizationId: user?.organizationId,
      message: `${user?.profile?.firstName} ${user?.profile?.lastName} updated a transaction in your organization`,
    });

    return reply({ res, results: finance });
  }

  /** Get one finance */
  @Get(`/:financeId/view`)
  @UseGuards(UserAuthGuard)
  async getOneByIdUser(
    @Res() res,
    @Req() req,
    @Param('financeId', ParseUUIDPipe) financeId: string,
  ) {
    const { user } = req;

    const findOneFinance = await this.financeService.findOneBy({
      financeId,
      organizationId: user.organizationId,
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
  @UseGuards(UserAuthGuard)
  async deleteOne(
    @Res() res,
    @Req() req,
    @Param('financeId', ParseUUIDPipe) financeId: string,
  ) {
    const { user } = req;

    const findOneFinance = await this.financeService.findOneBy({
      financeId,
      organizationId: user.organizationId,
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

    await this.activitylogsService.createOne({
      userId: user?.id,
      organizationId: user?.organizationId,
      message: `${user?.profile?.firstName} ${user?.profile?.lastName} deleted a transaction in your organization`,
    });

    return reply({ res, results: finance });
  }
}
