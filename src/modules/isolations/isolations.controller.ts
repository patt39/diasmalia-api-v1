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
import { UserAuthGuard } from '../users/middleware';
import {
  BulkIsolationsDto,
  CreateIsolationsDto,
  IsolationsQueryDto,
  UpdateIsolationsDto,
} from './isolations.dto';
import { IsolationsService } from './isolations.service';

@Controller('isolations')
export class IsolationsController {
  constructor(
    private readonly isolationsService: IsolationsService,
    private readonly animalsService: AnimalsService,
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
    const { animalTypeId, periode } = queryIsolations;

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
      periode: Number(periode),
      organizationId: user.organizationId,
    });

    return reply({ res, results: castrations });
  }

  /** Post one aves isolation */
  @Post(`/create/aves`)
  @UseGuards(UserAuthGuard)
  async createOne(@Res() res, @Req() req, @Body() body: CreateIsolationsDto) {
    const { user } = req;
    const { code, number, note } = body;

    const findOneAnimal = await this.animalsService.findOneByCode({
      code,
      status: 'ACTIVE',
      organizationId: user.organizationId,
    });
    if (!findOneAnimal)
      throw new HttpException(
        `Animal ${findOneAnimal?.code} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    if (findOneAnimal.quantity <= 0)
      throw new HttpException(
        `Unable to isolate, animals doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const isolation = await this.isolationsService.createOne({
      note,
      number,
      animalId: findOneAnimal.id,
      animalTypeId: findOneAnimal.animalTypeId,
      organizationId: user.organizationId,
      userCreatedId: user.id,
    });

    await this.activitylogsService.createOne({
      userId: user.id,
      message: `${user.profile?.firstName} ${user.profile?.lastName} put ${number} ${findOneAnimal.animalType.name} in ${findOneAnimal?.code} in isolation`,
      organizationId: user.organizationId,
    });

    return reply({
      res,
      results: {
        status: HttpStatus.CREATED,
        data: isolation,
        message: `Animal Created Successfully`,
      },
    });
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
        code: animal,
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
    @Body() body: UpdateIsolationsDto,
    @Param('isolationId', ParseUUIDPipe) isolationId: string,
  ) {
    const { user } = req;
    const { note, number } = body;

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
        number,
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

  /** Get one isolation */
  @Get(`/:isolationId/view`)
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
  @Delete(`/:isolationId/delete`)
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

    await this.animalsService.updateOne(
      { animalId: findOneIsolation.animal.id },
      { isIsolated: false },
    );

    await this.activitylogsService.createOne({
      userId: user.id,
      organizationId: user.organizationId,
      message: `${user.profile?.firstName} ${user.profile?.lastName} deleted an isolation in ${findOneIsolation.animalType.name}`,
    });

    return reply({ res, results: 'Isolation deleted successfully' });
  }
}
