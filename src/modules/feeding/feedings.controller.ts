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
import { AnimalsService } from '../animals/animals.service';
import { FeedTypeService } from '../feedType/feedType.service';
import { JwtAuthGuard } from '../users/middleware';
import { CreateOrUpdateFeedingsDto } from './feedings.dto';
import { FeedingsService } from './feedings.service';

@Controller('feedings')
export class FeedingsController {
  constructor(
    private readonly feedingsService: FeedingsService,
    private readonly feedTypeService: FeedTypeService,
    private readonly animalsService: AnimalsService,
  ) {}

  /** Get all Feedings */
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

    const feedings = await this.feedingsService.findAll({
      search,
      pagination,
      organizationId: user?.organizationId,
    });

    return reply({ res, results: feedings });
  }

  /** Post one feeding */
  @Post(`/`)
  @UseGuards(JwtAuthGuard)
  async createOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateFeedingsDto,
  ) {
    const { user } = req;
    const { date, quantity, feedTypeId, productionPhase, code, note } = body;

    const findOneAnimal = await this.animalsService.findOneBy({
      code,
      organizationId: user?.organizationId,
    });
    if (!findOneAnimal)
      throw new HttpException(
        `Animal ${code} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneFeedType = await this.feedTypeService.findOneBy({
      feedTypeId,
      organizationId: user?.organizationId,
    });
    if (!findOneFeedType)
      throw new HttpException(
        `Animal ${feedTypeId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const feeding = await this.feedingsService.createOne({
      date,
      note,
      quantity,
      productionPhase,
      animalId: findOneAnimal.id,
      feedTypeId: findOneFeedType.id,
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
    });

    return reply({ res, results: [HttpStatus.CREATED, feeding] });
  }

  /** Update one feeding */
  @Put(`/:feedingId`)
  @UseGuards(JwtAuthGuard)
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateFeedingsDto,
    @Param('feedingId', ParseUUIDPipe) feedingId: string,
  ) {
    const { user } = req;
    const { date, quantity, feedTypeId, code, note, productionPhase } = body;

    const findOneAnimal = await this.animalsService.findOneBy({
      code,
      organizationId: user?.organizationId,
    });
    if (!findOneAnimal)
      throw new HttpException(
        `Animal ${code} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneFeedType = await this.feedTypeService.findOneBy({
      feedTypeId,
      organizationId: user?.organizationId,
    });
    if (!findOneFeedType)
      throw new HttpException(
        `Animal ${feedTypeId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneFeeding = await this.feedingsService.findOneBy({
      feedingId,
      organizationId: user?.organizationId,
    });
    if (!findOneFeeding)
      throw new HttpException(
        `${feedingId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const death = await this.feedingsService.updateOne(
      { feedingId },
      {
        date,
        note,
        quantity,
        productionPhase,
        animalId: findOneAnimal.id,
        feedTypeId: findOneFeedType.id,
        organizationId: user?.organizationId,
        userCreatedId: user?.id,
      },
    );

    return reply({ res, results: death });
  }

  /** Get one feeding */
  @Get(`/view`)
  @UseGuards(JwtAuthGuard)
  async getOneByIdFeeding(
    @Res() res,
    @Res() req,
    @Query('feedingId', ParseUUIDPipe) feedingId: string,
  ) {
    const { user } = req;
    const findOneFeeding = await this.feedingsService.findOneBy({
      feedingId,
      organizationId: user?.organizationId,
    });
    if (!findOneFeeding)
      throw new HttpException(
        `${feedingId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    return reply({ res, results: findOneFeeding });
  }

  /** Delete one feeding */
  @Delete(`/delete/:feedingId`)
  @UseGuards(JwtAuthGuard)
  async deleteOne(
    @Res() res,
    @Req() req,
    @Param('feedingId', ParseUUIDPipe) feedingId: string,
  ) {
    const { user } = req;
    const findOneFeeding = await this.feedingsService.findOneBy({
      feedingId,
      organizationId: user?.organizationId,
    });
    if (!findOneFeeding)
      throw new HttpException(
        ` ${feedingId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const feeding = await this.feedingsService.updateOne(
      { feedingId },
      { deletedAt: new Date() },
    );

    return reply({ res, results: feeding });
  }
}
