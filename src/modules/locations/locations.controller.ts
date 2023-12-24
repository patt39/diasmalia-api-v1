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
} from '@nestjs/common';
import { reply } from '../../app/utils/reply';

import { LocationsService } from './locations.service';
import { SearchQueryDto } from '../../app/utils/search-query/search-query.dto';
import { CreateOrUpdateLocationsDto } from './locations.dto';
import { RequestPaginationDto } from '../../app/utils/pagination/request-pagination.dto';
import {
  addPagination,
  PaginationType,
} from '../../app/utils/pagination/with-pagination';
import { JwtAuthGuard } from '../users/middleware';

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

  /** Post one Locations */
  @Post(`/`)
  @UseGuards(JwtAuthGuard)
  async createOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateLocationsDto,
  ) {
    const { squareMeter, manger, through, number } = body;

    const location = await this.locationsService.createOne({
      squareMeter,
      manger,
      through,
      number,
    });

    return reply({ res, results: location });
  }

  /** Post one Locations */
  @Put(`/:locationId`)
  @UseGuards(JwtAuthGuard)
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateLocationsDto,
    @Param('locationId', ParseUUIDPipe) locationId: string,
  ) {
    const { squareMeter, manger, through, number } = body;

    const location = await this.locationsService.updateOne(
      { locationId },
      {
        squareMeter,
        manger,
        through,
        number,
      },
    );

    return reply({ res, results: location });
  }

  /** Get one Locations */
  @Get(`/view`)
  @UseGuards(JwtAuthGuard)
  async getOneByIdUser(
    @Res() res,
    @Query('locationId', ParseUUIDPipe) locationId: string,
  ) {
    const medication = await this.locationsService.findOneBy({
      locationId,
    });

    return reply({ res, results: medication });
  }

  /** Delete one Locations */
  @Delete(`/delete/:locationId`)
  @UseGuards(JwtAuthGuard)
  async deleteOne(
    @Res() res,
    @Param('locationId', ParseUUIDPipe) locationId: string,
  ) {
    const location = await this.locationsService.updateOne(
      { locationId },
      { deletedAt: new Date() },
    );

    return reply({ res, results: location });
  }
}
