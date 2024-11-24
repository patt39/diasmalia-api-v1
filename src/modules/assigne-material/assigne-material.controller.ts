import {
  Controller,
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
import { BuildingsService } from '../buildings/buildings.service';
import { LocationsService } from '../locations/locations.service';
import { MaterialService } from '../material/material.service';
import { UserAuthGuard } from '../users/middleware';
import { GetAssignMaterialsDto } from './assigne-material.dto';
import { AssignMaterialsService } from './assigne-material.service';

@Controller('assigned-material')
export class AssignMaterialsController {
  constructor(
    private readonly assignMaterialsService: AssignMaterialsService,
    private readonly materialsService: MaterialService,
    private readonly buildingsService: BuildingsService,
    private readonly locationsService: LocationsService,
    private readonly activitylogsService: ActivityLogsService,
  ) {}

  /** Get all assign materials */
  @Get(`/`)
  @UseGuards(UserAuthGuard)
  async findAll(
    @Res() res,
    @Req() req,
    @Query() requestPaginationDto: RequestPaginationDto,
    @Query() query: SearchQueryDto,
    @Query() queryAssignMaterials: GetAssignMaterialsDto,
  ) {
    const { user } = req;
    const { search } = query;
    const { locationId, buildingId, type } = queryAssignMaterials;

    const { take, page, sort, sortBy } = requestPaginationDto;
    const pagination: PaginationType = addPagination({
      page,
      take,
      sort,
      sortBy,
    });

    const assignTypes = await this.assignMaterialsService.findAll({
      type,
      search,
      pagination,
      locationId,
      buildingId,
      organizationId: user?.organizationId,
    });

    return reply({ res, results: assignTypes });
  }

  /** Assigne materials for building */
  @Post(`/:materialId/:buildingId/create`)
  @UseGuards(UserAuthGuard)
  async assignedMaterialForBuilding(
    @Res() res,
    @Req() req,
    @Param('buildingId', ParseUUIDPipe) buildingId: string,
    @Param('materialId', ParseUUIDPipe) materialId: string,
  ) {
    const { user } = req;

    const findOneMaterial = await this.materialsService.findOneBy({
      materialId,
    });
    if (!findOneMaterial)
      throw new HttpException(
        `MaterialId: ${materialId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneBuilding = await this.buildingsService.findOneBy({
      buildingId,
      organizationId: user?.organizationId,
    });
    if (!findOneBuilding)
      throw new HttpException(
        `BuildingId: ${buildingId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneAssignedMaterial = await this.assignMaterialsService.findOneBy(
      {
        materialId: findOneMaterial?.id,
        buildingId: findOneBuilding?.id,
      },
    );
    if (findOneAssignedMaterial)
      throw new HttpException(
        `${findOneMaterial?.name} already added please change`,
        HttpStatus.NOT_FOUND,
      );

    await this.assignMaterialsService.createOne({
      status: true,
      userCreatedId: user?.id,
      materialId: findOneMaterial?.id,
      buildingId: findOneBuilding?.id,
      organizationId: user?.organizationId,
    });

    await this.activitylogsService.createOne({
      userId: user?.id,
      organizationId: user?.organizationId,
      message: `${user?.profile?.firstName} ${user?.profile?.lastName} added ${findOneMaterial?.name} in your organization `,
    });

    return reply({ res, results: 'Saved' });
  }

  /** Assigne materials for location */
  @Post(`/:materialId/:locationId/aves-location`)
  @UseGuards(UserAuthGuard)
  async assignedMaterialForLocation(
    @Res() res,
    @Req() req,
    @Param('locationId', ParseUUIDPipe) locationId: string,
    @Param('materialId', ParseUUIDPipe) materialId: string,
  ) {
    const { user } = req;

    const findOneMaterial = await this.materialsService.findOneBy({
      materialId,
    });
    if (!findOneMaterial)
      throw new HttpException(
        `MaterialId: ${materialId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneLocation = await this.locationsService.findOneBy({
      locationId,
      organizationId: user?.organizationId,
    });
    if (!findOneLocation)
      throw new HttpException(
        `LocationId: ${locationId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneAssignedMaterial = await this.assignMaterialsService.findOneBy(
      {
        materialId: findOneMaterial?.id,
        locationId: findOneLocation?.id,
      },
    );
    if (findOneAssignedMaterial?.materialId)
      throw new HttpException(
        `${findOneAssignedMaterial?.material?.name} already added please change`,
        HttpStatus.NOT_FOUND,
      );

    await this.assignMaterialsService.createOne({
      status: true,
      userCreatedId: user?.id,
      materialId: findOneMaterial?.id,
      locationId: findOneLocation?.id,
      organizationId: user?.organizationId,
    });

    await this.activitylogsService.createOne({
      userId: user?.id,
      organizationId: user?.organizationId,
      message: `${user?.profile?.firstName} ${user?.profile?.lastName} added ${findOneMaterial?.name} in your organization `,
    });

    return reply({ res, results: 'Saved' });
  }

  @Post(`/:materialId/create`)
  @UseGuards(UserAuthGuard)
  async assignedMaterial(
    @Res() res,
    @Req() req,
    @Param('materialId', ParseUUIDPipe) materialId: string,
  ) {
    const { user } = req;

    const findOneMaterial = await this.materialsService.findOneBy({
      materialId,
    });
    if (!findOneMaterial)
      throw new HttpException(
        `MaterialId: ${materialId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneAssignedMaterial = await this.assignMaterialsService.findOneBy(
      { materialId: findOneMaterial?.id, organizationId: user?.organizationId },
    );
    if (findOneAssignedMaterial?.materialId)
      throw new HttpException(
        `${findOneAssignedMaterial?.material?.name} already added please change`,
        HttpStatus.NOT_FOUND,
      );

    await this.assignMaterialsService.createOne({
      status: true,
      type: 'TOOL',
      userCreatedId: user?.id,
      materialId: findOneMaterial?.id,
      organizationId: user?.organizationId,
    });

    await this.activitylogsService.createOne({
      userId: user?.id,
      organizationId: user?.organizationId,
      message: `${user?.profile?.firstName} ${user?.profile?.lastName} added ${findOneMaterial?.name} in your organization `,
    });

    return reply({ res, results: 'Saved' });
  }

  @Put(`/:assignMaterialId/change-status`)
  @UseGuards(UserAuthGuard)
  async changeStatus(
    @Res() res,
    @Req() req,
    @Param('assignMaterialId', ParseUUIDPipe) assignMaterialId: string,
  ) {
    const { user } = req;

    const findOneMaterial = await this.assignMaterialsService.findOneBy({
      assignMaterialId,
      organizationId: user?.organizationId,
    });
    if (!findOneMaterial)
      throw new HttpException(
        `AssignMaterialId: ${assignMaterialId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    await this.assignMaterialsService.updateOne(
      { assignMaterialId: findOneMaterial?.id },
      { status: !findOneMaterial?.status },
    );

    return reply({ res, results: 'Status changed successfully' });
  }

  /** Get one assigne material */
  @Get(`/:materialId/view`)
  @UseGuards(UserAuthGuard)
  async getOneByIdAnimal(
    @Res() res,
    @Req() req,
    @Param('materialId', ParseUUIDPipe) materialId: string,
  ) {
    const { user } = req;
    const findOneMaterial = await this.assignMaterialsService.findOneBy({
      materialId,
      organizationId: user?.organizationId,
    });
    if (!findOneMaterial)
      throw new HttpException(
        `Material ${materialId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    return reply({ res, results: findOneMaterial });
  }
}
