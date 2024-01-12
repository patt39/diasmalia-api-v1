import {
  Controller,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  Delete,
  Res,
  Req,
  Get,
  Query,
  UseGuards,
  Put,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { reply } from '../../app/utils/reply';
import { FeedingsService } from './feedings.service';
import { AnimalsService } from '../animals/animals.service';
import { SearchQueryDto } from '../../app/utils/search-query/search-query.dto';
import { CreateOrUpdateFeedingsDto } from './feedings.dto';
import { RequestPaginationDto } from '../../app/utils/pagination/request-pagination.dto';
import {
  addPagination,
  PaginationType,
} from '../../app/utils/pagination/with-pagination';
import { JwtAuthGuard } from '../users/middleware';

@Controller('feedings')
export class FeedingsController {
  constructor(
    private readonly feedingsService: FeedingsService,
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

  /** Post one Feeding */
  @Post(`/`)
  @UseGuards(JwtAuthGuard)
  async createOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateFeedingsDto,
  ) {
    const { user } = req;
    const { date, quantity, type, animalId, note } = body;

    const findOneAnimal = await this.animalsService.findOneBy({
      animalId,
    });

    if (!findOneAnimal)
      throw new HttpException(
        `Animal doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const feeding = await this.feedingsService.createOne({
      date,
      quantity,
      type,
      animalId: findOneAnimal.id,
      note,
      productionPhase: findOneAnimal.productionPhase,
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
    });

    return reply({ res, results: feeding });
  }

  /** Update one Death */
  @Put(`/:feedingId`)
  @UseGuards(JwtAuthGuard)
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateFeedingsDto,
    @Param('feedingId', ParseUUIDPipe) feedingId: string,
  ) {
    const { user } = req;
    const { date, quantity, type, animalId, note, productionPhase } = body;

    const death = await this.feedingsService.updateOne(
      { feedingId },
      {
        date,
        quantity,
        type,
        animalId,
        note,
        productionPhase,
        organizationId: user?.organizationId,
        userCreatedId: user?.id,
      },
    );

    return reply({ res, results: death });
  }

  /** Get one Death */
  @Get(`/view`)
  @UseGuards(JwtAuthGuard)
  async getOneByIdUser(
    @Res() res,
    @Query('feedingId', ParseUUIDPipe) feedingId: string,
  ) {
    const death = await this.feedingsService.findOneBy({
      feedingId,
    });

    return reply({ res, results: death });
  }

  /** Delete one Death */
  @Delete(`/delete/:feedingId`)
  @UseGuards(JwtAuthGuard)
  async deleteOne(
    @Res() res,
    @Param('feedingId', ParseUUIDPipe) feedingId: string,
  ) {
    const feeding = await this.feedingsService.updateOne(
      { feedingId },
      { deletedAt: new Date() },
    );

    return reply({ res, results: feeding });
  }
}
