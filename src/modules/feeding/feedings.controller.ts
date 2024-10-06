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
  PaginationType,
  addPagination,
} from '../../app/utils/pagination/with-pagination';
import { reply } from '../../app/utils/reply';
import { SearchQueryDto } from '../../app/utils/search-query/search-query.dto';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { AnimalsService } from '../animals/animals.service';
import { FeedStocksService } from '../feed-stock/feed-stock.service';
import { UserAuthGuard } from '../users/middleware';
import {
  BulkFeedingsDto,
  CreateFeedingsDto,
  GetFeedQueryDto,
  UpdateFeedingsDto,
} from './feedings.dto';
import { FeedingsService } from './feedings.service';

@Controller('feedings')
export class FeedingsController {
  constructor(
    private readonly feedingsService: FeedingsService,
    private readonly animalsService: AnimalsService,
    private readonly feedStocksService: FeedStocksService,
    private readonly activitylogsService: ActivityLogsService,
  ) {}

  /** Get all Feedings */
  @Get(`/`)
  @UseGuards(UserAuthGuard)
  async findAll(
    @Res() res,
    @Req() req,
    @Query() requestPaginationDto: RequestPaginationDto,
    @Query() query: SearchQueryDto,
    @Query() queryFeeding: GetFeedQueryDto,
  ) {
    const { user } = req;
    const { search } = query;
    const { animalTypeId, periode } = queryFeeding;

    const { take, page, sort, sortBy } = requestPaginationDto;
    const pagination: PaginationType = addPagination({
      page,
      take,
      sort,
      sortBy,
    });

    const feedings = await this.feedingsService.findAll({
      search,
      pagination,
      animalTypeId,
      periode: Number(periode),
      organizationId: user?.organizationId,
    });

    return reply({ res, results: feedings });
  }

  /** Post one aves feeding */
  @Post(`/create/aves`)
  @UseGuards(UserAuthGuard)
  async createOne(@Res() res, @Req() req, @Body() body: CreateFeedingsDto) {
    const { user } = req;
    const { code, quantity, feedStockId } = body;

    const findOneAnimal = await this.animalsService.findOneByCode({
      code,
      status: 'ACTIVE',
      organizationId: user.organizationId,
    });
    if (!findOneAnimal)
      throw new HttpException(
        `Animal ${code} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    if (findOneAnimal?.quantity === 0)
      throw new HttpException(
        `Unable to feed, animals doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const feeding = await this.feedingsService.createOne({
      quantity,
      feedStockId,
      animalId: findOneAnimal?.id,
      productionPhase: findOneAnimal?.productionPhase,
      animalTypeId: findOneAnimal?.animalTypeId,
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
    });

    await this.activitylogsService.createOne({
      userId: user?.id,
      message: `${user?.profile?.firstName} ${user?.profile?.lastName} added a feeding for ${findOneAnimal?.animalType?.name} with code ${findOneAnimal?.code} `,
      organizationId: user?.organizationId,
    });

    return reply({
      res,
      results: {
        status: HttpStatus.CREATED,
        data: feeding,
        message: `Feeding Created Successfully`,
      },
    });
  }

  /** Post one Bulk feeding */
  @Post(`/bulk/create`)
  @UseGuards(UserAuthGuard)
  async createOneBulk(@Res() res, @Req() req, @Body() body: BulkFeedingsDto) {
    const { user } = req;
    const { quantity, animals, feedStockId } = body;

    for (const animal of animals) {
      const findOneAnimal = await this.animalsService.findOneBy({
        status: 'ACTIVE',
        code: animal,
      });
      if (!findOneAnimal)
        throw new HttpException(
          `Animal ${findOneAnimal?.code} doesn't exists please change`,
          HttpStatus.NOT_FOUND,
        );

      const findFeedStock = await this.feedStocksService.findOneBy({
        feedStockId,
        organizationId: user?.organizationId,
        animalTypeId: findOneAnimal?.animalTypeId,
      });
      if (!findFeedStock)
        throw new HttpException(
          `FeedStockId: ${feedStockId} doesn't exists please change`,
          HttpStatus.NOT_FOUND,
        );

      if (findFeedStock?.weight < quantity)
        throw new HttpException(
          `Insuficient amount of feed available please update feed stock`,
          HttpStatus.NOT_FOUND,
        );

      const animalFed = Number(quantity / animals?.length);

      await this.feedingsService.createOne({
        quantity: animalFed,
        animalId: findOneAnimal?.id,
        feedStockId: findFeedStock?.id,
        productionPhase: findOneAnimal?.productionPhase,
        animalTypeId: findOneAnimal?.animalTypeId,
        organizationId: user?.organizationId,
        userCreatedId: user?.id,
      });

      await this.feedStocksService.updateOne(
        { feedStockId: findFeedStock?.id },
        { weight: findFeedStock?.weight - quantity },
      );

      await this.activitylogsService.createOne({
        userId: user?.id,
        organizationId: user?.organizationId,
        message: `${user?.profile?.firstName} ${user?.profile?.lastName} feeded ${animals?.lenght} ${findOneAnimal?.animalType?.name} with ${findFeedStock?.feedCategory.toLocaleLowerCase()}`,
      });
    }

    return reply({ res, results: 'Saved' });
  }

  /** Update one feeding */
  @Put(`/:feedingId/edit`)
  @UseGuards(UserAuthGuard)
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: UpdateFeedingsDto,
    @Param('feedingId', ParseUUIDPipe) feedingId: string,
  ) {
    const { user } = req;
    const { quantity, feedStockId, code } = body;

    const findOneFeeding = await this.feedingsService.findOneBy({
      feedingId,
      organizationId: user?.organizationId,
    });
    if (!findOneFeeding)
      throw new HttpException(
        `FeedingId: ${feedingId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneAnimal = await this.animalsService.findOneByCode({
      code,
      organizationId: user?.organizationId,
    });
    if (!findOneAnimal)
      throw new HttpException(
        `Code: ${code} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const findFeedStock = await this.feedStocksService.findOneBy({
      feedStockId,
    });
    if (!findFeedStock)
      throw new HttpException(
        `FeedStockId: ${feedStockId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    await this.feedingsService.updateOne(
      { feedingId: findOneFeeding?.id },
      {
        quantity,
        feedStockId: findFeedStock?.id,
        animalId: findOneAnimal?.id,
        userCreatedId: user?.id,
      },
    );

    await this.activitylogsService.createOne({
      userId: user?.id,
      organizationId: user?.organizationId,
      message: `${user?.profile?.firstName} ${user?.profile?.lastName} updated a feeding in ${findOneFeeding?.animalType.name} for ${findOneFeeding?.animal?.code}`,
    });

    return reply({ res, results: 'Feeding Updated Successfully' });
  }

  /** Delete one feeding */
  @Delete(`/:feedingId/delete`)
  @UseGuards(UserAuthGuard)
  async deleteOne(
    @Res() res,
    @Req() req,
    @Param('feedingId', ParseUUIDPipe) feedingId: string,
  ) {
    const { user } = req;

    const findOneFeeding = await this.feedingsService.findOneBy({
      feedingId,
      organizationId: user.organizationId,
    });
    if (!findOneFeeding)
      throw new HttpException(
        `FeedingId: ${feedingId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const feeding = await this.feedingsService.updateOne(
      { feedingId: findOneFeeding?.id },
      { deletedAt: new Date() },
    );

    await this.activitylogsService.createOne({
      userId: user?.id,
      organizationId: user?.organizationId,
      message: `${user?.profile?.firstName} ${user?.profile?.lastName} deleted a feeding in ${findOneFeeding?.animalType?.name}`,
    });

    return reply({ res, results: feeding });
  }
}
