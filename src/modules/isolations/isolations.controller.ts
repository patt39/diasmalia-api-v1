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
import { AnimalsService } from '../animals/animals.service';
import { AssignTypesService } from '../assigne-type/assigne-type.service';
import { UserAuthGuard } from '../users/middleware';
import {
  BulkIsolationsDto,
  CreateOrUpdateIsolationsDto,
  IsolationsQueryDto,
} from './isolations.dto';
import { IsolationsService } from './isolations.service';

@Controller('isolations')
export class IsolationsController {
  constructor(
    private readonly isolationsService: IsolationsService,
    private readonly animalsService: AnimalsService,
    private readonly assignTypesService: AssignTypesService,
    private readonly activitylogsService: ActivityLogsService,
  ) {}

  /** Get all isolations */
  @Get(`/`)
  @UseGuards(UserAuthGuard)
  async findAll(
    @Res() res,
    @Req() req,
    @Query() requestPaginationDto: RequestPaginationDto,
    @Query() query: SearchQueryDto,
    @Query() queryIsolations: IsolationsQueryDto,
  ) {
    const { user } = req;
    const { search } = query;
    const { animalTypeId } = queryIsolations;

    const { take, page, sort, sortBy } = requestPaginationDto;
    const pagination: PaginationType = addPagination({
      page,
      take,
      sort,
      sortBy,
    });

    const castrations = await this.isolationsService.findAll({
      search,
      pagination,
      animalTypeId,
      organizationId: user.organizationId,
    });

    return reply({ res, results: castrations });
  }

  /** Post one Bulk isolation */
  @Post(`/bulk/create`)
  @UseGuards(UserAuthGuard)
  async createOneBulk(@Res() res, @Req() req, @Body() body: BulkIsolationsDto) {
    const { user } = req;
    const { animals, note } = body;

    for (const animal of animals) {
      const findOneAnimal = await this.animalsService.findOneBy({
        status: 'ACTIVE',
        code: animal.code,
      });
      if (!findOneAnimal)
        throw new HttpException(
          `Animal ${findOneAnimal?.code} doesn't exists please change`,
          HttpStatus.NOT_FOUND,
        );

      await this.isolationsService.createOne({
        note,
        animalId: findOneAnimal.id,
        organizationId: findOneAnimal.organizationId,
        animalTypeId: findOneAnimal.animalTypeId,
        userCreatedId: user.id,
      });

      await this.animalsService.updateOne(
        { animalId: findOneAnimal.id },
        { isIsolated: true },
      );

      await this.activitylogsService.createOne({
        userId: user.id,
        organizationId: user.organizationId,
        message: `${user.profile?.firstName} ${user.profile?.lastName} isolation ${animals.lenght} ${findOneAnimal.animalType.name}`,
      });
    }

    return reply({ res, results: 'Saved' });
  }

  /** Update one isolation */
  @Put(`/:isolationId/edit`)
  @UseGuards(UserAuthGuard)
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateIsolationsDto,
    @Param('isolationId', ParseUUIDPipe) isolationId: string,
  ) {
    const { user } = req;
    const { note } = body;

    const findOneIsolation = await this.isolationsService.findOneBy({
      isolationId,
      organizationId: user.organizationId,
    });
    if (!findOneIsolation)
      throw new HttpException(
        `IsolationId: ${isolationId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const isolation = await this.isolationsService.updateOne(
      { isolationId: findOneIsolation?.id },
      {
        note,
        userCreatedId: user.id,
      },
    );

    await this.activitylogsService.createOne({
      userId: user.id,
      organizationId: user.organizationId,
      message: `${user.profile?.firstName} ${user.profile?.lastName} updated an isolation in ${findOneIsolation.animalType.name}`,
    });

    return reply({ res, results: isolation });
  }

  /** Get one incubation */
  @Get(`/view/:isolationId`)
  @UseGuards(UserAuthGuard)
  async getOneByIdWeaning(
    @Res() res,
    @Req() req,
    @Param('isolationId', ParseUUIDPipe) isolationId: string,
  ) {
    const { user } = req;

    const findOneIsolation = await this.isolationsService.findOneBy({
      isolationId,
      organizationId: user.organizationId,
    });
    if (!findOneIsolation)
      throw new HttpException(
        `IsolationId: ${isolationId} doesn't exists, please change`,
        HttpStatus.NOT_FOUND,
      );

    return reply({ res, results: findOneIsolation });
  }

  /** Delete one isolation */
  @Delete(`/delete/:isolationId`)
  @UseGuards(UserAuthGuard)
  async deleteOne(
    @Res() res,
    @Req() req,
    @Param('isolationId', ParseUUIDPipe) isolationId: string,
  ) {
    const { user } = req;

    const findOneIsolation = await this.isolationsService.findOneBy({
      isolationId,
      organizationId: user.organizationId,
    });
    if (!findOneIsolation)
      throw new HttpException(
        `IsolationId: ${isolationId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    await this.isolationsService.updateOne(
      { isolationId: findOneIsolation.id },
      { deletedAt: new Date() },
    );

    await this.activitylogsService.createOne({
      userId: user.id,
      organizationId: user.organizationId,
      message: `${user.profile?.firstName} ${user.profile?.lastName} deleted an isolation in ${findOneIsolation.animalType.name}`,
    });

    return reply({ res, results: 'Isolation deleted successfully' });
  }
}
