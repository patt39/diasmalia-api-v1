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
import { config } from '../../app/config/index';
import { reply } from '../../app/utils/reply';

import { generateNumber } from 'src/app/utils/commons';
import { RequestPaginationDto } from '../../app/utils/pagination/request-pagination.dto';
import {
  addPagination,
  PaginationType,
} from '../../app/utils/pagination/with-pagination';
import { SearchQueryDto } from '../../app/utils/search-query/search-query.dto';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
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
    private readonly activitylogsService: ActivityLogsService,
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

    const { take, page, sort, sortBy } = requestPaginationDto;
    const pagination: PaginationType = addPagination({
      page,
      take,
      sort,
      sortBy,
    });

    const locations = await this.locationsService.findAll({
      search,
      pagination,
      animalTypeId,
      productionPhase,
      organizationId: user.organizationId,
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

    const findOneLocation = await this.locationsService.findOneByCode({
      code,
      organizationId: user.organizationId,
    });
    if (findOneLocation)
      throw new HttpException(
        `Location ${findOneLocation?.code} already exists please change`,
        HttpStatus.FOUND,
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

    const appInitials = config.datasite.name.substring(0, 1).toUpperCase();
    const orgInitials = user.organization.name.substring(0, 1).toUpperCase();

    const location = await this.locationsService.createOne({
      manger,
      through,
      squareMeter,
      productionPhase,
      code: code ? code : `${orgInitials}${generateNumber(4)}${appInitials}`,
      animalTypeId: findOneAssignType?.animalTypeId,
      organizationId: user.organizationId,
      userCreatedId: user.id,
    });

    await this.activitylogsService.createOne({
      userId: user?.id,
      organizationId: user?.organizationId,
      message: `${user?.profile?.firstName} ${user?.profile?.lastName} created a location in ${findOneAssignType?.animalType?.name}`,
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

  /** Change location status */
  @Put(`/:locationId/change-status`)
  @UseGuards(UserAuthGuard)
  async enableCurrency(
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
        `CurrencyId: ${locationId} doesn't exists, please change`,
        HttpStatus.NOT_FOUND,
      );

    await this.locationsService.updateOne(
      { locationId: findOneLocation.id },
      { status: !findOneLocation.status },
    );

    return reply({ res, results: 'Status changed successfully' });
  }

  /** Update one location */
  @Put(`/:locationId/edit`)
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
      organizationId: user?.organizationId,
    });
    if (!findOneLocation)
      throw new HttpException(
        `Location ${code} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const location = await this.locationsService.updateOne(
      { locationId: findOneLocation?.id },
      {
        code,
        manger,
        through,
        squareMeter,
        userCreatedId: user?.id,
      },
    );

    await this.activitylogsService.createOne({
      userId: user?.id,
      organizationId: user?.organizationId,
      message: `${user.profile?.firstName} ${user.profile?.lastName} updated a location in ${findOneLocation.animalType.name}`,
    });

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
  @Delete(`/:locationId/delete`)
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
      { locationId: findOneLocation?.id },
      { deletedAt: new Date() },
    );

    await this.activitylogsService.createOne({
      userId: user.id,
      organizationId: user?.organizationId,
      message: `${user.profile?.firstName} ${user.profile?.lastName} deleted a location in ${findOneLocation.animalType.name}`,
    });

    return reply({ res, results: 'Location deleted successfully' });
  }
}
