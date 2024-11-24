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
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { AssignTypesService } from '../assigne-type/assigne-type.service';
import { UserAuthGuard } from '../users/middleware';
import {
  CreateOrUpdateBuildingsDto,
  GetBuildingsQueryDto,
} from './buildings.dto';
import { BuildingsService } from './buildings.service';

@Controller('buildings')
export class BuildingsController {
  constructor(
    private readonly buildingsService: BuildingsService,
    private readonly assignTypesService: AssignTypesService,
    private readonly activitylogsService: ActivityLogsService,
  ) {}

  /** Get all buildings */
  @Get(`/`)
  @UseGuards(UserAuthGuard)
  async findAll(
    @Res() res,
    @Req() req,
    @Query() requestPaginationDto: RequestPaginationDto,
    @Query() query: SearchQueryDto,
    @Query() queryLocations: GetBuildingsQueryDto,
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

    const locations = await this.buildingsService.findAll({
      search,
      pagination,
      animalTypeId,
      productionPhase,
      organizationId: user?.organizationId,
    });

    return reply({ res, results: locations });
  }

  /** Post one building */
  @Post(`/:animalTypeId/create`)
  @UseGuards(UserAuthGuard)
  async createOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateBuildingsDto,
    @Param('animalTypeId', ParseUUIDPipe) animalTypeId: string,
  ) {
    const { user } = req;
    const { code, squareMeter, productionPhase } = body;

    const findOneAssignType = await this.assignTypesService.findOneBy({
      animalTypeId,
      organizationId: user?.organizationId,
    });
    if (!findOneAssignType)
      throw new HttpException(
        `AnimalType not assigned please change`,
        HttpStatus.NOT_FOUND,
      );

    await this.buildingsService.createOne({
      code,
      squareMeter,
      productionPhase,
      animalTypeId: findOneAssignType?.animalTypeId,
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
    });

    await this.activitylogsService.createOne({
      userId: user?.id,
      organizationId: user?.organizationId,
      message: `${user?.profile?.firstName} ${user?.profile?.lastName} created a building in ${findOneAssignType?.animalType?.name}`,
    });

    return reply({
      res,
      results: {
        message: `Building Created Successfully`,
      },
    });
  }

  /** Update one building */
  @Put(`/:buildingId/edit`)
  @UseGuards(UserAuthGuard)
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateBuildingsDto,
    @Param('buildingId', ParseUUIDPipe) buildingId: string,
  ) {
    const { user } = req;
    const { code, squareMeter, productionPhase } = body;

    const findOneBuilding = await this.buildingsService.findOneBy({
      buildingId,
      organizationId: user?.organizationId,
    });
    if (!findOneBuilding)
      throw new HttpException(
        `Location doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const building = await this.buildingsService.updateOne(
      { buildingId: findOneBuilding?.id },
      {
        code,
        squareMeter,
        productionPhase,
      },
    );

    await this.activitylogsService.createOne({
      userId: user?.id,
      organizationId: user?.organizationId,
      message: `${user?.profile?.firstName} ${user?.profile?.lastName} updated building ${findOneBuilding?.code} in ${findOneBuilding?.animalType?.name}`,
    });

    return reply({
      res,
      results: {
        status: HttpStatus.CREATED,
        data: building,
        message: `Building Updated Successfully`,
      },
    });
  }

  /** Get one building */
  @Get(`/:buildingId/view`)
  @UseGuards(UserAuthGuard)
  async getOneByIdUser(
    @Res() res,
    @Req() req,
    @Param('buildingId', ParseUUIDPipe) buildingId: string,
  ) {
    const { user } = req;

    const findOneBuilding = await this.buildingsService.findOneBy({
      buildingId,
      organizationId: user.organizationId,
    });
    if (!findOneBuilding)
      throw new HttpException(
        `BuildingId: ${buildingId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    return reply({ res, results: findOneBuilding });
  }

  /** Delete one Location */
  @Delete(`/:buildingId/delete`)
  @UseGuards(UserAuthGuard)
  async deleteOne(
    @Res() res,
    @Req() req,
    @Param('buildingId', ParseUUIDPipe) buildingId: string,
  ) {
    const { user } = req;

    const findOneBuilding = await this.buildingsService.findOneBy({
      buildingId,
      organizationId: user?.organizationId,
    });
    if (!findOneBuilding)
      throw new HttpException(
        `BuildingId: ${buildingId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    await this.buildingsService.updateOne(
      { buildingId: findOneBuilding?.id },
      { deletedAt: new Date() },
    );

    await this.activitylogsService.createOne({
      userId: user?.id,
      organizationId: user?.organizationId,
      message: `${user?.profile?.firstName} ${user?.profile?.lastName} deleted location ${findOneBuilding?.code} in ${findOneBuilding?.animalType?.name}`,
    });

    return reply({ res, results: 'Building deleted successfully' });
  }
}
