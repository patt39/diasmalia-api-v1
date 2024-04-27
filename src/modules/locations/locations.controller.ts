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
import { AssignTypesService } from '../assigne-type/assigne-type.service';
import { UserAuthGuard } from '../users/middleware';
import {
  CreateOrUpdateLocationsDto,
  GetLocationsQueryDto,
} from './locations.dto';
import { LocationsService } from './locations.service';

@Controller('locations')
export class LocationsController {
  constructor(
    private readonly locationsService: LocationsService,
    private readonly assignTypesService: AssignTypesService,
  ) {}

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
    const { productionPhase, animalTypeId } = queryLocations;

    const { take, page, sort } = requestPaginationDto;
    const pagination: PaginationType = addPagination({ page, take, sort });

    const locations = await this.locationsService.findAll({
      search,
      pagination,
      animalTypeId,
      productionPhase,
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
    const {
      code,
      manger,
      through,
      squareMeter,
      productionPhase,
      animalTypeId,
    } = body;

    const findOneLocation = await this.locationsService.findOneBy({
      code,
      productionPhase,
      organizationId: user.organizationId,
    });
    if (findOneLocation)
      throw new HttpException(
        `Location ${code} already exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneAssignType = await this.assignTypesService.findOneBy({
      animalTypeId,
      organizationId: user.organizationId,
    });
    if (!findOneAssignType)
      throw new HttpException(
        `AnimalType not assigned please change`,
        HttpStatus.NOT_FOUND,
      );

    const location = await this.locationsService.createOne({
      code,
      manger,
      through,
      squareMeter,
      productionPhase,
      animalTypeId: findOneAssignType.animalTypeId,
      organizationId: user.organizationId,
      userCreatedId: user.id,
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
    const { squareMeter, manger, through, code } = body;

    const findOneLocation = await this.locationsService.findOneBy({
      code,
      locationId,
      organizationId: user.organizationId,
    });
    if (!findOneLocation)
      throw new HttpException(
        `Location ${code} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const location = await this.locationsService.updateOne(
      { locationId: findOneLocation.id },
      {
        code,
        manger,
        through,
        squareMeter,
        userCreatedId: user.id,
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
      organizationId: user.organizationId,
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
      organizationId: user.organizationId,
    });
    if (!findOneLocation)
      throw new HttpException(
        `LocationId: ${locationId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    await this.locationsService.updateOne(
      { locationId: findOneLocation.id },
      { deletedAt: new Date() },
    );

    return reply({ res, results: 'Location deleted successfully' });
  }
}
