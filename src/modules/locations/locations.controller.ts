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

import { generateNumber } from 'src/app/utils/commons';
import { RequestPaginationDto } from '../../app/utils/pagination/request-pagination.dto';
import {
  addPagination,
  PaginationType,
} from '../../app/utils/pagination/with-pagination';
import { SearchQueryDto } from '../../app/utils/search-query/search-query.dto';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { AnimalsService } from '../animals/animals.service';
import { AssignTypesService } from '../assigne-type/assigne-type.service';
import { BuildingsService } from '../buildings/buildings.service';
import { UserAuthGuard } from '../users/middleware';
import {
  AnimalChangeLocationsDto,
  CreateBulkLocationsDto,
  CreateOrUpdateLocationsDto,
  GetLocationsQueryDto,
} from './locations.dto';
import { LocationsService } from './locations.service';

@Controller('locations')
export class LocationsController {
  constructor(
    private readonly locationsService: LocationsService,
    private readonly animalsService: AnimalsService,
    private readonly buildingsService: BuildingsService,
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
    const { productionPhase, animalTypeId, status, addCages, buildingId } =
      queryLocations;

    const { take, page, sort, sortBy } = requestPaginationDto;
    const pagination: PaginationType = addPagination({
      page,
      take,
      sort,
      sortBy,
    });

    const locations = await this.locationsService.findAll({
      status,
      search,
      addCages,
      buildingId,
      pagination,
      animalTypeId,
      productionPhase,
      organizationId: user?.organizationId,
    });

    return reply({ res, results: locations });
  }

  /** Post one location */
  @Post(`/:animalTypeId/create`)
  @UseGuards(UserAuthGuard)
  async createOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateLocationsDto,
    @Param('animalTypeId', ParseUUIDPipe) animalTypeId: string,
  ) {
    const { user } = req;
    const {
      code,
      nest,
      cages,
      manger,
      through,
      addCages,
      squareMeter,
      buildingCode,
      productionPhase,
    } = body;

    const findOneAssignType = await this.assignTypesService.findOneBy({
      animalTypeId,
      organizationId: user?.organizationId,
    });
    if (!findOneAssignType)
      throw new HttpException(
        `AnimalType not assigned please change`,
        HttpStatus.NOT_FOUND,
      );

    const orgInitials = user.organization.name.substring(0, 1).toUpperCase();
    const codeGenerated = `${orgInitials}${generateNumber(3)}`;

    const findOneLocation = await this.locationsService.findOneBy({
      code,
      organizationId: user?.organizationId,
    });
    if (code == findOneLocation?.code)
      throw new HttpException(
        `Location code: ${findOneLocation?.code} already exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneBuilding = await this.buildingsService.findOneBy({
      code: buildingCode,
      organizationId: user?.organizationId,
    });

    await this.locationsService.createOne({
      nest,
      cages,
      manger,
      through,
      addCages,
      squareMeter,
      productionPhase,
      buildingId: buildingCode ? findOneBuilding?.id : null,
      code: code ? code.toUpperCase() : codeGenerated.toLowerCase(),
      animalTypeId: findOneAssignType?.animalTypeId,
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
    });

    await this.activitylogsService.createOne({
      userId: user?.id,
      organizationId: user?.organizationId,
      message: `${user?.profile?.firstName} ${user?.profile?.lastName} created a location in ${findOneAssignType?.animalType?.name}`,
    });

    return reply({
      res,
      results: {
        message: `Location Created Successfully`,
      },
    });
  }

  /** Create bulk locations */
  @Post(`/:animalTypeId/bulk`)
  @UseGuards(UserAuthGuard)
  async createMany(
    @Res() res,
    @Req() req,
    @Body() body: CreateBulkLocationsDto,
    @Param('animalTypeId', ParseUUIDPipe) animalTypeId: string,
  ) {
    const { user } = req;
    const {
      number,
      manger,
      through,
      squareMeter,
      buildingCode,
      productionPhase,
    } = body;

    const findOneAssignType = await this.assignTypesService.findOneBy({
      animalTypeId,
      organizationId: user?.organizationId,
    });
    if (!findOneAssignType)
      throw new HttpException(
        `AnimalType not assigned please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneBuilding = await this.buildingsService.findOneBy({
      code: buildingCode,
      organizationId: user?.organizationId,
    });
    if (!findOneBuilding)
      throw new HttpException(
        `Code: ${buildingCode} already doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const orgInitials = user.organization.name.substring(0, 1).toUpperCase();
    const newAnimalArray: any = [];

    for (let i = 0; i < number; i++) {
      const animal = await this.locationsService.createOne({
        manger,
        through,
        squareMeter,
        buildingId: findOneBuilding?.id,
        productionPhase: productionPhase
          ? productionPhase
          : findOneBuilding?.productionPhase,
        code: `${orgInitials}${generateNumber(3)}`,
        animalTypeId: findOneAssignType?.animalTypeId,
        organizationId: user?.organizationId,
        userCreatedId: user?.id,
      });

      newAnimalArray.push(animal);

      await this.activitylogsService.createOne({
        userId: user?.id,
        message: `${user?.profile?.firstName} ${user?.profile?.lastName} added location ${animal?.code} in ${findOneAssignType?.animalType?.name}`,
        organizationId: user.organizationId,
      });
    }

    return reply({
      res,
      results: {
        status: HttpStatus.CREATED,
        message: `Animals Created Successfully`,
      },
    });
  }

  /** Animals change location */
  @Put(`/:locationId/change-location`)
  @UseGuards(UserAuthGuard)
  async createOneBulk(
    @Res() res,
    @Req() req,
    @Body() body: AnimalChangeLocationsDto,
    @Param('locationId', ParseUUIDPipe) locationId: string,
  ) {
    const { user } = req;
    const { animals, locationCode } = body;

    const findOneLocation = await this.locationsService.findOneBy({
      locationId,
      organizationId: user?.organizationId,
    });
    if (!findOneLocation)
      throw new HttpException(
        `LocationId: ${locationId} doesn't exists, please change`,
        HttpStatus.NOT_FOUND,
      );

    for (const animal of animals) {
      const findOneAnimal = await this.animalsService.findOneBy({
        code: animal,
      });

      const findOneLocation = await this.locationsService.findOneBy({
        code: locationCode,
        animalTypeId: findOneAnimal?.animalTypeId,
        organizationId: user?.organizationId,
      });
      if (!findOneLocation)
        throw new HttpException(
          `LocationId: ${locationCode} doesn't exists please change`,
          HttpStatus.NOT_FOUND,
        );

      await this.animalsService.updateOne(
        { animalId: findOneAnimal?.id },
        { locationId: findOneLocation?.id },
      );

      await this.locationsService.updateOne(
        { locationId: findOneLocation?.id },
        { productionPhase: findOneAnimal?.productionPhase },
      );

      await this.activitylogsService.createOne({
        userId: user?.id,
        organizationId: user?.organizationId,
        message: `${user?.profile?.firstName} ${user?.profile?.lastName} changed ${findOneAnimal?.code} location in ${findOneAnimal?.animalType?.name}`,
      });
    }

    return reply({ res, results: 'Saved' });
  }

  /** Change location status */
  @Put(`/:locationId/change-status`)
  @UseGuards(UserAuthGuard)
  async changeStatus(
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
        `LocationId: ${locationId} doesn't exists, please change`,
        HttpStatus.NOT_FOUND,
      );

    if (findOneLocation?._count?.animals !== 0) {
      throw new HttpException(
        `Impossible to change status location: ${findOneLocation?.code} isn't empty please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    await this.locationsService.updateOne(
      { locationId: findOneLocation?.id },
      { status: !findOneLocation?.status },
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
    const {
      code,
      nest,
      cages,
      manger,
      through,
      addCages,
      squareMeter,
      productionPhase,
    } = body;

    const findOneLocation = await this.locationsService.findOneBy({
      locationId,
      organizationId: user?.organizationId,
    });
    if (!findOneLocation)
      throw new HttpException(
        `Location doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const location = await this.locationsService.updateOne(
      { locationId: findOneLocation?.id },
      {
        nest,
        code,
        cages,
        manger,
        through,
        addCages,
        squareMeter,
        productionPhase,
      },
    );

    await this.activitylogsService.createOne({
      userId: user?.id,
      organizationId: user?.organizationId,
      message: `${user?.profile?.firstName} ${user?.profile?.lastName} updated location ${findOneLocation?.code} in ${findOneLocation?.animalType?.name}`,
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
  @Get(`/:locationId/view`)
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
      organizationId: user?.organizationId,
    });
    if (!findOneLocation)
      throw new HttpException(
        `LocationId: ${locationId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    if (
      findOneLocation?._count?.animals !== 0 ||
      findOneLocation?.status === false
    ) {
      throw new HttpException(
        `Impossible to delete location: ${findOneLocation?.code} isn't empty please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    await this.locationsService.updateOne(
      { locationId: findOneLocation?.id },
      { deletedAt: new Date() },
    );

    await this.activitylogsService.createOne({
      userId: user?.id,
      organizationId: user?.organizationId,
      message: `${user?.profile?.firstName} ${user?.profile?.lastName} deleted location ${findOneLocation?.code} in ${findOneLocation?.animalType?.name}`,
    });

    return reply({ res, results: 'Location deleted successfully' });
  }
}
