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
import { BatchsService } from '../batchs/batchs.service';
import { UserAuthGuard } from '../users/middleware';
import { CreateOrUpdateEggHavestingsDto } from './egg-havesting.dto';
import { EggHavestingsService } from './egg-havesting.service';

@Controller('egg-havestings')
export class EggHavestingsController {
  constructor(
    private readonly eggHavestingsService: EggHavestingsService,
    private readonly batchsService: BatchsService,
  ) {}

  @Get(`/`)
  @UseGuards(UserAuthGuard)
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

    const eggHavestings = await this.eggHavestingsService.findAll({
      search,
      pagination,
      organizationId: user?.organizationId,
    });

    return reply({ res, results: eggHavestings });
  }

  /** Post one weaning */
  @Post(`/create`)
  @UseGuards(UserAuthGuard)
  async createOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateEggHavestingsDto,
  ) {
    const { user } = req;
    const { quantity, date, note, batchId } = body;

    const findOneBatch = await this.batchsService.findOneBy({
      batchId,
    });
    if (!findOneBatch)
      throw new HttpException(
        `BatchId: ${batchId} doesn't exists`,
        HttpStatus.NOT_FOUND,
      );

    const eggHavesting = await this.eggHavestingsService.createOne({
      note,
      date,
      quantity,
      batchId: findOneBatch?.id,
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
    });

    return reply({ res, results: eggHavesting });
  }

  /** Update one EggHavesting */
  @Put(`/:eggHavestingId/edit`)
  @UseGuards(UserAuthGuard)
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateEggHavestingsDto,
    @Param('eggHavestingId', ParseUUIDPipe) eggHavestingId: string,
  ) {
    const { user } = req;
    const { quantity, date, note, batchId } = body;

    const findOneBatch = await this.batchsService.findOneBy({
      batchId,
      organizationId: user?.organizationId,
    });
    if (!findOneBatch)
      throw new HttpException(
        `BatchId: ${batchId} doesn't exists, please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneEggHavesting = await this.eggHavestingsService.findOneBy({
      eggHavestingId,
    });
    if (!findOneEggHavesting)
      throw new HttpException(
        `EggHavestingId: ${eggHavestingId} doesn't exists, please change`,
        HttpStatus.NOT_FOUND,
      );

    const eggHavesting = await this.eggHavestingsService.updateOne(
      { eggHavestingId: findOneEggHavesting?.id },
      {
        note,
        date,
        quantity,
        batchId: findOneBatch?.id,
        organizationId: user?.organizationId,
        userCreatedId: user?.id,
      },
    );

    return reply({ res, results: eggHavesting });
  }

  /** Get one EggHavesting */
  @Get(`/view/:weaningId`)
  @UseGuards(UserAuthGuard)
  async getOneByIdWeaning(
    @Res() res,
    @Req() req,
    @Param('weaningId', ParseUUIDPipe) eggHavestingId: string,
  ) {
    const { user } = req;
    const findOneEggHavesting = await this.eggHavestingsService.findOneBy({
      eggHavestingId,
      organizationId: user?.organizationId,
    });
    if (!findOneEggHavesting)
      throw new HttpException(
        `EggHavestingId: ${eggHavestingId} doesn't exists, please change`,
        HttpStatus.NOT_FOUND,
      );

    return reply({ res, results: findOneEggHavesting });
  }

  /** Delete Weaning */
  @Delete(`/delete/:weaningId`)
  @UseGuards(UserAuthGuard)
  async deleteOne(
    @Res() res,
    @Req() req,
    @Param('weaningId', ParseUUIDPipe) eggHavestingId: string,
  ) {
    const { user } = req;
    const findOneEggHavesting = await this.eggHavestingsService.findOneBy({
      eggHavestingId,
      organizationId: user?.organizationId,
    });
    if (!findOneEggHavesting)
      throw new HttpException(
        `EggHavestingId: ${eggHavestingId} doesn't exists, please change`,
        HttpStatus.NOT_FOUND,
      );

    await this.eggHavestingsService.updateOne(
      { eggHavestingId: findOneEggHavesting?.id },
      { deletedAt: new Date() },
    );

    return reply({ res, results: 'EggHavesting deleted successfully' });
  }
}
