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
import { RequestPaginationDto } from '../../app/utils/pagination/request-pagination.dto';
import {
  addPagination,
  PaginationType,
} from '../../app/utils/pagination/with-pagination';
import { reply } from '../../app/utils/reply';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { AssignTypesService } from '../assigne-type/assigne-type.service';
import { UserAuthGuard } from '../users/middleware';
import {
  CreateFeedStocksDto,
  GetFeedStockQueryDto,
  UpdateFeedStocksDto,
} from './feed-stock.dto';
import { FeedStocksService } from './feed-stock.service';

@Controller('feed-stock')
export class FeedStocksController {
  constructor(
    private readonly feedStocksService: FeedStocksService,
    private readonly assignTypesService: AssignTypesService,
    private readonly activitylogsService: ActivityLogsService,
  ) {}

  /** Get all Feed stocks */
  @Get(`/`)
  @UseGuards(UserAuthGuard)
  async findAll(
    @Res() res,
    @Req() req,
    @Query() requestPaginationDto: RequestPaginationDto,
    @Query() queryFeeding: GetFeedStockQueryDto,
  ) {
    const { user } = req;
    const { animalTypeId, animalTypeName } = queryFeeding;

    const { take, page, sort, sortBy } = requestPaginationDto;
    const pagination: PaginationType = addPagination({
      page,
      take,
      sort,
      sortBy,
    });

    const feedStock = await this.feedStocksService.findAll({
      pagination,
      animalTypeId,
      animalTypeName,
      organizationId: user?.organizationId,
    });

    return reply({ res, results: feedStock });
  }

  /** Post one feed stock */
  @Post(`/create`)
  @UseGuards(UserAuthGuard)
  async addCompostion(
    @Res() res,
    @Req() req,
    @Body() body: CreateFeedStocksDto,
  ) {
    const { user } = req;
    const { number, bagWeight, feedCategory, animalTypeId, weight } = body;

    const findOneAssignType = await this.assignTypesService.findOneBy({
      animalTypeId,
      organizationId: user?.organizationId,
    });
    if (!findOneAssignType)
      throw new HttpException(
        `Animal Type not assigned please change`,
        HttpStatus.NOT_FOUND,
      );

    if (
      [
        'Poulet de chair',
        'Poulets Goliaths',
        'Poulets brahma',
        'Pondeuses',
        'Pintardes',
        'Dindes',
        'Canards',
        'Quails',
        'Pisciculture',
      ].includes(findOneAssignType?.animalType?.name) &&
      [
        'LACTATING FEMALES',
        'FEMELLES ALLAITANTES',
        'PREGNANT FEMALE',
        'FEMELLES GESTANTES',
        'SILAGES',
        'ENSILAGES',
        'FORAGES',
        'FOURAGES',
      ].includes(feedCategory)
    )
      throw new HttpException(
        `Impossible to create bad feed category`,
        HttpStatus.BAD_REQUEST,
      );

    if (
      [
        'Cuniculture',
        'Bovins',
        'Caprins',
        'Ovins',
        'Porciculture',
        'Pisciculture',
      ].includes(findOneAssignType?.animalType?.name) &&
      ['LAY FOOD', 'ALIMENT PONTE'].includes(feedCategory)
    )
      throw new HttpException(
        `Impossible to create bad feed category`,
        HttpStatus.BAD_REQUEST,
      );

    const totalWeight = Number(bagWeight * number);

    const findOneFeedStock = await this.feedStocksService.findOneBy({
      feedCategory,
      organizationId: user?.organizationId,
      animalTypeId: findOneAssignType?.animalTypeId,
    });
    if (findOneFeedStock)
      throw new HttpException(
        `Feed Type ${feedCategory} already created please update`,
        HttpStatus.FOUND,
      );

    const feedStock = await this.feedStocksService.createOne({
      number,
      bagWeight,
      feedCategory,
      weight: totalWeight ? totalWeight : weight,
      animalTypeName: findOneAssignType?.animalType?.name,
      animalTypeId: findOneAssignType?.animalTypeId,
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
    });

    await this.activitylogsService.createOne({
      userId: user?.id,
      message: `${user?.profile?.firstName} ${user?.profile?.lastName} added ${number} bags in feed stock for ${findOneAssignType?.animalType?.name} `,
      organizationId: user?.organizationId,
    });

    return reply({
      res,
      results: {
        status: HttpStatus.CREATED,
        data: feedStock,
        message: `Feed Stock Created Successfully`,
      },
    });
  }

  /** Update one feed stock */
  @Put(`/:feedStockId/edit`)
  @UseGuards(UserAuthGuard)
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: UpdateFeedStocksDto,
    @Param('feedStockId', ParseUUIDPipe) feedStockId: string,
  ) {
    const { user } = req;
    const {
      number,
      bagWeight,
      animalTypeId,
      feedCategory,
      composition,
      weight,
    } = body;

    const findOneFeedStock = await this.feedStocksService.findOneBy({
      feedStockId,
      organizationId: user?.organizationId,
    });
    if (!findOneFeedStock)
      throw new HttpException(
        `FeedStockId: ${feedStockId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneAssignType = await this.assignTypesService.findOneBy({
      animalTypeId,
      organizationId: user?.organizationId,
    });
    if (!findOneAssignType)
      throw new HttpException(
        `AnimalType not assigned please change`,
        HttpStatus.NOT_FOUND,
      );

    const totalWeight = Number(bagWeight * number);

    await this.feedStocksService.updateOne(
      { feedStockId: findOneFeedStock?.id },
      {
        number,
        bagWeight,
        feedCategory,
        composition: composition,
        weight: totalWeight ? totalWeight : weight,
        animalTypeName: findOneAssignType?.animalType?.name,
        animalTypeId: findOneAssignType?.animalTypeId,
        userCreatedId: user?.id,
      },
    );

    await this.activitylogsService.createOne({
      userId: user?.id,
      organizationId: user?.organizationId,
      message: `${user?.profile?.firstName} ${user?.profile?.lastName} updated a feed stock in ${findOneAssignType?.animalType.name}`,
    });

    return reply({ res, results: 'Feed stock updated successfully' });
  }

  /** Delete one feeding */
  @Delete(`/:feedStockId/delete`)
  @UseGuards(UserAuthGuard)
  async deleteOne(
    @Res() res,
    @Req() req,
    @Param('feedStockId', ParseUUIDPipe) feedStockId: string,
  ) {
    const { user } = req;

    const findOneFeedStock = await this.feedStocksService.findOneBy({
      feedStockId,
      organizationId: user?.organizationId,
    });
    if (!findOneFeedStock)
      throw new HttpException(
        `FeedStockId: ${feedStockId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const feedStock = await this.feedStocksService.updateOne(
      { feedStockId: findOneFeedStock?.id },
      { deletedAt: new Date() },
    );

    await this.activitylogsService.createOne({
      userId: user?.id,
      organizationId: user?.organizationId,
      message: `${user?.profile?.firstName} ${user?.profile?.lastName} deleted a feed stock for ${findOneFeedStock?.animalType?.name}`,
    });

    return reply({ res, results: feedStock });
  }
}
