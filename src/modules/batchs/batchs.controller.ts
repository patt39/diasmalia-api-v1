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
import { LocationsService } from '../locations/locations.service';
import { UserAuthGuard } from '../users/middleware';
import { CreateOrUpdateBatchsDto, GetBirdsByType } from './batchs.dto';
import { BatchsService } from './batchs.service';

@Controller('batchs')
export class BatchesController {
  constructor(
    private readonly batchsService: BatchsService,
    private readonly locationsService: LocationsService,
  ) {}

  /** Get all batchs */
  @Get(`/`)
  @UseGuards(UserAuthGuard)
  async findAll(
    @Res() res,
    @Req() req,
    @Query() requestPaginationDto: RequestPaginationDto,
    @Query() query: SearchQueryDto,
    @Query() queryTypes: GetBirdsByType,
  ) {
    const { user } = req;
    const { search } = query;
    const { type } = queryTypes;

    const { take, page, sort } = requestPaginationDto;
    const pagination: PaginationType = addPagination({ page, take, sort });

    const batch = await this.batchsService.findAll({
      type,
      search,
      pagination,
      organizationId: user?.organizationId,
    });

    return reply({ res, results: batch });
  }

  /** Post one batch */
  @Post(`/create`)
  @UseGuards(UserAuthGuard)
  async createOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateBatchsDto,
  ) {
    const { user } = req;
    const { quantity, weight, type, locationId } = body;

    const findOneLocation = await this.locationsService.findOneBy({
      locationId,
    });
    if (!findOneLocation)
      throw new HttpException(
        `Location doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const batch = await this.batchsService.createOne({
      type,
      weight,
      quantity,
      locationId,
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
    });

    return reply({ res, results: batch });
  }

  /** Update one batch */
  @Put(`/:batchId/edit`)
  @UseGuards(UserAuthGuard)
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateBatchsDto,
    @Param('batchId', ParseUUIDPipe) batchId: string,
  ) {
    const { user } = req;
    const { quantity, type, weight, locationId } = body;

    const findOneBatch = await this.batchsService.findOneBy({
      batchId,
    });
    if (!findOneBatch)
      throw new HttpException(
        `BatchId: ${batchId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneLocation = await this.locationsService.findOneBy({
      locationId,
    });
    if (!findOneLocation)
      throw new HttpException(
        `Location doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const breed = await this.batchsService.updateOne(
      { batchId: findOneBatch?.id },
      {
        type,
        weight,
        quantity,
        locationId: findOneLocation?.id,
        organizationId: user?.organizationId,
        userCreatedId: user?.id,
      },
    );

    return reply({ res, results: breed });
  }

  /** Get one batch */
  @Get(`/view/:batchId`)
  @UseGuards(UserAuthGuard)
  async getOneByIdBreed(
    @Res() res,
    @Req() req,
    @Param('batchId') batchId: string,
  ) {
    const { user } = req;
    const findOneBatch = await this.batchsService.findOneBy({
      batchId,
      organizationId: user?.organizationId,
    });
    if (!findOneBatch)
      throw new HttpException(
        `BreedId: ${batchId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    return reply({ res, results: findOneBatch });
  }

  /** Delete one batch */
  @Delete(`/delete/:batchId`)
  @UseGuards(UserAuthGuard)
  async deleteOne(
    @Res() res,
    @Req() req,
    @Param('batchId', ParseUUIDPipe) batchId: string,
  ) {
    const { user } = req;
    const findOneBatch = await this.batchsService.findOneBy({
      batchId,
      organizationId: user?.organizationId,
    });
    if (!findOneBatch)
      throw new HttpException(
        `BatchId: ${batchId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    await this.batchsService.updateOne(
      { batchId: findOneBatch?.id },
      { deletedAt: new Date() },
    );

    return reply({ res, results: 'Batch deleted successfully' });
  }
}
