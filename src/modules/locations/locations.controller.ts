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
import { JwtAuthGuard } from '../users/middleware';
import { CreateOrUpdateLocationsDto } from './locations.dto';
import { LocationsService } from './locations.service';

@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  /** Get all Locations */
  @Get(`/`)
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Res() res,
    @Req() req,
    @Query() requestPaginationDto: RequestPaginationDto,
    @Query() query: SearchQueryDto,
  ) {
    const { search } = query;

    const { take, page, sort } = requestPaginationDto;
    const pagination: PaginationType = addPagination({ page, take, sort });

    const Locations = await this.locationsService.findAll({
      search,
      pagination,
    });

    return reply({ res, results: Locations });
  }

  /** Post one Location */
  @Post(`/`)
  @UseGuards(JwtAuthGuard)
  async createOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateLocationsDto,
  ) {
    const { user } = req;
    const { squareMeter, manger, through, number } = body;

    const location = await this.locationsService.createOne({
      squareMeter,
      manger,
      through,
      number,
      organizationId: user.organizationId,
    });

    return reply({ res, results: location });
  }

  /** Update one location */
  @Put(`/:locationId`)
  @UseGuards(JwtAuthGuard)
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateLocationsDto,
    @Param('locationId', ParseUUIDPipe) locationId: string,
  ) {
    const { user } = req;
    const { squareMeter, manger, through, number } = body;

    const findOneLocation = await this.locationsService.findOneBy({
      locationId,
      organizationId: user?.organization,
    });
    if (!findOneLocation) {
      throw new HttpException(
        `Location ${locationId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }
    const location = await this.locationsService.updateOne(
      { locationId: findOneLocation?.id },
      {
        squareMeter,
        manger,
        through,
        number,
        organizationId: user.organizationId,
      },
    );

    return reply({ res, results: location });
  }

  /** Get one Location */
  @Get(`/view`)
  @UseGuards(JwtAuthGuard)
  async getOneByIdUser(
    @Res() res,
    @Req() req,
    @Query('locationId', ParseUUIDPipe) locationId: string,
  ) {
    const { user } = req;
    const findOneLocation = await this.locationsService.findOneBy({
      locationId,
      organizationId: user?.organization,
    });
    if (!findOneLocation) {
      throw new HttpException(
        `Location ${locationId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }
    const location = await this.locationsService.findOneBy({
      locationId,
      organizationId: user?.organization,
    });

    return reply({ res, results: location });
  }

  /** Delete one Location */
  @Delete(`/delete/:locationId`)
  @UseGuards(JwtAuthGuard)
  async deleteOne(
    @Res() res,
    @Req() req,
    @Param('locationId', ParseUUIDPipe) locationId: string,
  ) {
    const { user } = req;
    const findOneLocation = await this.locationsService.findOneBy({
      locationId,
      organizationId: user?.organization,
    });
    if (!findOneLocation) {
      throw new HttpException(
        `Location ${locationId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }
    const location = await this.locationsService.updateOne(
      { locationId },
      { deletedAt: new Date() },
    );

    return reply({ res, results: location });
  }
}
