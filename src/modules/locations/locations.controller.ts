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
import { UserAuthGuard } from '../users/middleware';
import {
  CreateOrUpdateLocationsDto,
  GetLocationsQueryDto,
} from './locations.dto';
import { LocationsService } from './locations.service';

@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  /** Get all locations */
  @Get(`/`)
  @UseGuards(UserAuthGuard)
  async findAll(
    @Res() res,
    @Req() req,
    @Query() requestPaginationDto: RequestPaginationDto,
    @Query() query: SearchQueryDto,
    @Query() queryLocations: GetLocationsQueryDto,
  ) {
    const { user } = req;
    const { search } = query;
    const { type } = queryLocations;

    const { take, page, sort } = requestPaginationDto;
    const pagination: PaginationType = addPagination({ page, take, sort });

    const locations = await this.locationsService.findAll({
      type,
      search,
      pagination,
      organizationId: user?.organizationId,
    });

    return reply({ res, results: locations });
  }

  /** Post one location */
  @Post(`/create`)
  @UseGuards(UserAuthGuard)
  async createOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateLocationsDto,
  ) {
    const { user } = req;
    const { squareMeter, manger, through, number, type } = body;

    const findOneLocation = await this.locationsService.findOneBy({
      type,
      number,
    });
    if (findOneLocation) {
      throw new HttpException(
        `Location ${number} already exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    const location = await this.locationsService.createOne({
      type,
      number,
      manger,
      through,
      squareMeter,
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
    });

    return reply({
      res,
      results: {
        status: HttpStatus.CREATED,
        data: location,
        message: `Location Created Successfully`,
      },
    });
  }

  /** Update one location */
  @Put(`/:locationId`)
  @UseGuards(UserAuthGuard)
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateLocationsDto,
    @Param('locationId', ParseUUIDPipe) locationId: string,
  ) {
    const { user } = req;
    const { squareMeter, manger, through, number, type } = body;

    const findOneLocation = await this.locationsService.findOneBy({
      type,
      number,
      locationId,
    });
    if (!findOneLocation)
      throw new HttpException(
        `Location ${number} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    const location = await this.locationsService.updateOne(
      { locationId: findOneLocation?.id },
      {
        manger,
        number,
        through,
        squareMeter,
        organizationId: user?.organizationId,
      },
    );

    return reply({
      res,
      results: {
        status: HttpStatus.CREATED,
        data: location,
        message: `Location Updated Successfully`,
      },
    });
  }

  /** Get one location */
  @Get(`/view/:locationId`)
  @UseGuards(UserAuthGuard)
  async getOneByIdUser(
    @Res() res,
    @Req() req,
    @Param('locationId', ParseUUIDPipe) locationId: string,
  ) {
    const { user } = req;
    const findOneLocation = await this.locationsService.findOneBy({
      locationId,
      organizationId: user?.organizationId,
    });
    if (!findOneLocation)
      throw new HttpException(
        `LocationId: ${locationId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    return reply({ res, results: findOneLocation });
  }

  /** Delete one Location */
  @Delete(`/delete/:locationId`)
  @UseGuards(UserAuthGuard)
  async deleteOne(
    @Res() res,
    @Req() req,
    @Param('locationId', ParseUUIDPipe) locationId: string,
  ) {
    const { user } = req;
    const findOneLocation = await this.locationsService.findOneBy({
      locationId,
      organizationId: user?.organizationId,
    });
    if (!findOneLocation)
      throw new HttpException(
        `LocationId: ${locationId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    await this.locationsService.updateOne(
      { locationId: findOneLocation?.id },
      { deletedAt: new Date() },
    );

    return reply({ res, results: 'Location deleted successfully' });
  }
}
