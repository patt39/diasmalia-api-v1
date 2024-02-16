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
import { JwtAuthGuard } from '../users/middleware';
import { CreateOrUpdateFeedTypesDto } from './feedType.dto';
import { FeedTypeService } from './feedType.service';

@Controller('feedTypes')
export class FeedTypeController {
  constructor(private readonly feedTypeService: FeedTypeService) {}

  /** Get all FeedTypes */
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

    const feedType = await this.feedTypeService.findAll({
      search,
      pagination,
      organizationId: user?.organizationId,
    });

    return reply({ res, results: feedType });
  }

  /** Post one feedType */
  @Post(`/`)
  @UseGuards(JwtAuthGuard)
  async createOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateFeedTypesDto,
  ) {
    const { user } = req;
    const { name } = body;

    const findOneFeedType = await this.feedTypeService.findOneBy({
      name,
      organizationId: user?.organizationId,
    });
    if (findOneFeedType)
      throw new HttpException(
        `FeedType ${name} already exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const feedType = await this.feedTypeService.createOne({
      name,
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
    });

    return reply({ res, results: [HttpStatus.CREATED, feedType] });
  }

  /** Update one feedType */
  @Put(`/:feedTypeId`)
  @UseGuards(JwtAuthGuard)
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateFeedTypesDto,
    @Param('feedTypeId', ParseUUIDPipe) feedTypeId: string,
  ) {
    const { user } = req;
    const { name } = body;

    const findOneFeeding = await this.feedTypeService.findOneBy({
      feedTypeId,
      organizationId: user?.organizationId,
    });
    if (!findOneFeeding)
      throw new HttpException(
        `${feedTypeId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const feedType = await this.feedTypeService.updateOne(
      { feedTypeId: findOneFeeding?.id },
      {
        name,
        organizationId: user?.organizationId,
        userCreatedId: user?.id,
      },
    );

    return reply({ res, results: feedType });
  }

  /** Get one feedType */
  @Get(`/view`)
  @UseGuards(JwtAuthGuard)
  async getOneByIdFeedType(
    @Res() res,
    @Res() req,
    @Query('feedTypeId', ParseUUIDPipe) feedTypeId: string,
  ) {
    const { user } = req;
    const findOneFeeding = await this.feedTypeService.findOneBy({
      feedTypeId,
      organizationId: user?.organizationId,
    });
    if (!findOneFeeding)
      throw new HttpException(
        `${feedTypeId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    return reply({ res, results: findOneFeeding });
  }

  /** Delete one feedType */
  @Delete(`/delete/:feedTypeId`)
  @UseGuards(JwtAuthGuard)
  async deleteOne(
    @Res() res,
    @Req() req,
    @Param('feedTypeId', ParseUUIDPipe) feedTypeId: string,
  ) {
    const { user } = req;
    const findOneFeedType = await this.feedTypeService.findOneBy({
      feedTypeId,
      organizationId: user?.organizationId,
    });
    if (!findOneFeedType)
      throw new HttpException(
        ` ${feedTypeId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const feeding = await this.feedTypeService.updateOne(
      { feedTypeId: findOneFeedType.id },
      { deletedAt: new Date() },
    );

    return reply({ res, results: feeding });
  }
}
