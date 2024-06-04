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
import { EggHavestingsService } from '../egg-havesting/egg-havesting.service';
import { UserAuthGuard } from '../users/middleware';
import {
  CreateOrUpdateEggHavestingsDto,
  IncubationQueryDto,
} from './incubation.dto';
import { IncubationsService } from './incubation.service';

@Controller('incubations')
export class IncubationsController {
  constructor(
    private readonly incubationsService: IncubationsService,
    private readonly eggHavestingsService: EggHavestingsService,
    private readonly activitylogsService: ActivityLogsService,
  ) {}

  @Get(`/`)
  @UseGuards(UserAuthGuard)
  async findAll(
    @Res() res,
    @Req() req,
    @Query() requestPaginationDto: RequestPaginationDto,
    @Query() query: SearchQueryDto,
    @Query() queryIncubation: IncubationQueryDto,
  ) {
    const { user } = req;
    const { search } = query;
    const { animalTypeId } = queryIncubation;

    const { take, page, sort, sortBy } = requestPaginationDto;
    const pagination: PaginationType = addPagination({
      page,
      take,
      sort,
      sortBy,
    });

    const eggHavestings = await this.incubationsService.findAll({
      search,
      pagination,
      animalTypeId,
      organizationId: user.organizationId,
    });

    return reply({ res, results: eggHavestings });
  }

  /** Post one incubation */
  @Post(`/create`)
  @UseGuards(UserAuthGuard)
  async createOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateEggHavestingsDto,
  ) {
    const { user } = req;
    const { dueDate, quantityStart, eggHavestingId } = body;

    const findOneEggHavesting = await this.eggHavestingsService.findOneBy({
      eggHavestingId,
      organizationId: user.organizationId,
    });
    if (!findOneEggHavesting)
      throw new HttpException(
        `EggHavesting: ${eggHavestingId} doesn't exists`,
        HttpStatus.NOT_FOUND,
      );

    const incubation = await this.incubationsService.createOne({
      dueDate,
      quantityStart,
      eggHavestingId: findOneEggHavesting.id,
      animalTypeId: findOneEggHavesting.animalTypeId,
      organizationId: user.organizationId,
      userCreatedId: user.id,
    });

    await this.activitylogsService.createOne({
      userId: user.id,
      organizationId: user.organizationId,
      message: `${user.profile?.firstName} ${user.profile?.lastName} created an incubation in ${findOneEggHavesting}`,
    });

    return reply({ res, results: incubation });
  }

  /** Update one Incubation */
  @Put(`/:incubationId/edit`)
  @UseGuards(UserAuthGuard)
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateEggHavestingsDto,
    @Param('incubationId', ParseUUIDPipe) incubationId: string,
  ) {
    const { user } = req;
    const { quantityEnd, quantityStart, dueDate } = body;

    const findOneIncubation = await this.incubationsService.findOneBy({
      incubationId,
      organizationId: user.organizationId,
    });
    if (!findOneIncubation)
      throw new HttpException(
        `IncubationId: ${incubationId} doesn't exists, please change`,
        HttpStatus.NOT_FOUND,
      );

    if (quantityEnd > quantityStart)
      throw new HttpException(
        `QuantityEnd: ${quantityEnd} can't be greater than quantityStart: ${quantityStart}`,
        HttpStatus.AMBIGUOUS,
      );

    const incubation = await this.incubationsService.updateOne(
      { incubationId: findOneIncubation?.id },
      {
        dueDate,
        quantityEnd,
        quantityStart,
        userCreatedId: user.id,
      },
    );

    await this.activitylogsService.createOne({
      userId: user.id,
      message: `${user.profile?.firstName} ${user.profile?.lastName} updated an incubation in ${findOneIncubation.animalType.name}`,
    });

    return reply({ res, results: incubation });
  }

  /** Delete Incubation */
  @Delete(`/delete/:incubationId`)
  @UseGuards(UserAuthGuard)
  async deleteOne(
    @Res() res,
    @Req() req,
    @Param('incubationId', ParseUUIDPipe) incubationId: string,
  ) {
    const { user } = req;

    const findOneIncubation = await this.incubationsService.findOneBy({
      incubationId,
      organizationId: user.organizationId,
    });
    if (!findOneIncubation)
      throw new HttpException(
        `IncubationId: ${incubationId} doesn't exists, please change`,
        HttpStatus.NOT_FOUND,
      );

    await this.incubationsService.updateOne(
      { incubationId: findOneIncubation.id },
      { deletedAt: new Date() },
    );

    await this.activitylogsService.createOne({
      userId: user.id,
      organizationId: user.organizationId,
      message: `${user.profile?.firstName} ${user.profile?.lastName} deleted an incubation in ${findOneIncubation.animalType.name}`,
    });

    return reply({ res, results: 'Incubation deleted successfully' });
  }
}
