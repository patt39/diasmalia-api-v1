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
  CreateOrUpdateEggHavestingsDto,
  EggHavestingQueryDto,
} from './egg-havesting.dto';
import { EggHavestingsService } from './egg-havesting.service';

@Controller('egg-havestings')
export class EggHavestingsController {
  constructor(
    private readonly eggHavestingsService: EggHavestingsService,
    private readonly assignTypesService: AssignTypesService,
    private readonly animalsService: AnimalsService,
    private readonly activitylogsService: ActivityLogsService,
  ) {}

  @Get(`/`)
  @UseGuards(UserAuthGuard)
  async findAll(
    @Res() res,
    @Req() req,
    @Query() requestPaginationDto: RequestPaginationDto,
    @Query() query: SearchQueryDto,
    @Query() queryEggHavesting: EggHavestingQueryDto,
  ) {
    const { user } = req;
    const { search } = query;
    const { size, method, animalTypeId } = queryEggHavesting;

    const { take, page, sort } = requestPaginationDto;
    const pagination: PaginationType = addPagination({ page, take, sort });

    const eggHavestings = await this.eggHavestingsService.findAll({
      size,
      method,
      search,
      pagination,
      animalTypeId,
      organizationId: user.organizationId,
    });

    return reply({ res, results: eggHavestings });
  }

  /** Post one eggHavesting */
  @Post(`/create`)
  @UseGuards(UserAuthGuard)
  async createOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateEggHavestingsDto,
  ) {
    const { user } = req;
    const { size, quantity, note, method, code, animalTypeId } = body;

    const findOneAssignType = await this.assignTypesService.findOneBy({
      animalTypeId,
      organizationId: user.organizationId,
    });
    if (!findOneAssignType)
      throw new HttpException(
        `AnimalType not assigned please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneAnimal = await this.animalsService.findOneBy({
      code,
      productionPhase: 'LAYING',
    });
    if (!findOneAnimal)
      throw new HttpException(
        `Animal ${findOneAnimal.code} doesn't exists or isn't in LAYING phase`,
        HttpStatus.NOT_FOUND,
      );

    const eggHavesting = await this.eggHavestingsService.createOne({
      note,
      size,
      method,
      quantity,
      animalId: findOneAnimal.id,
      animalTypeId: findOneAssignType.animalTypeId,
      organizationId: user.organizationId,
      userCreatedId: user.id,
    });

    await this.activitylogsService.createOne({
      userId: user.id,
      date: new Date(),
      actionId: eggHavesting.id,
      message: `${user.profile?.firstName} ${user.profile?.lastName} created an egg havesting`,
      organizationId: user.organizationId,
    });

    return reply({ res, results: eggHavesting });
  }

  /** Update one EggHavesting */
  @Put(`/:eggHavestingId/edit`)
  @UseGuards(UserAuthGuard)
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateEggHavestingsDto,
    @Param('eggHavestingId', ParseUUIDPipe) eggHavestingId: string,
  ) {
    const { user } = req;
    const { code, size, quantity, note, method, animalTypeId } = body;

    const findOneAnimal = await this.animalsService.findOneBy({
      code,
      animalTypeId,
      productionPhase: 'LAYING',
    });
    if (!findOneAnimal)
      throw new HttpException(
        `Animal ${findOneAnimal.code} doesn't exists or isn't in LAYING phase`,
        HttpStatus.NOT_FOUND,
      );

    const findOneEggHavesting = await this.eggHavestingsService.findOneBy({
      eggHavestingId,
      organizationId: user.organizationId,
    });
    if (!findOneEggHavesting)
      throw new HttpException(
        `EggHavestingId: ${eggHavestingId} doesn't exists, please change`,
        HttpStatus.NOT_FOUND,
      );

    const eggHavesting = await this.eggHavestingsService.updateOne(
      { eggHavestingId: findOneEggHavesting.id },
      {
        note,
        size,
        method,
        quantity,
        animalId: findOneAnimal.id,
        userCreatedId: user.id,
      },
    );

    await this.activitylogsService.createOne({
      userId: user.id,
      date: new Date(),
      message: `${user.profile?.firstName} ${user.profile?.lastName} updated an egg havesting`,
      organizationId: user.organizationId,
    });

    return reply({ res, results: eggHavesting });
  }

  /** Get one EggHavesting */
  @Get(`/view/:eggHavestingId`)
  @UseGuards(UserAuthGuard)
  async getOneByIdWeaning(
    @Res() res,
    @Req() req,
    @Param('eggHavestingId', ParseUUIDPipe) eggHavestingId: string,
  ) {
    const { user } = req;

    const findOneEggHavesting = await this.eggHavestingsService.findOneBy({
      eggHavestingId,
      organizationId: user.organizationId,
    });
    if (!findOneEggHavesting)
      throw new HttpException(
        `EggHavestingId: ${eggHavestingId} doesn't exists, please change`,
        HttpStatus.NOT_FOUND,
      );

    return reply({ res, results: findOneEggHavesting });
  }

  /** Delete eggHavesting */
  @Delete(`/delete/:eggHavestingId`)
  @UseGuards(UserAuthGuard)
  async deleteOne(
    @Res() res,
    @Req() req,
    @Param('eggHavestingId', ParseUUIDPipe) eggHavestingId: string,
  ) {
    const { user } = req;

    const findOneEggHavesting = await this.eggHavestingsService.findOneBy({
      eggHavestingId,
      organizationId: user.organizationId,
    });
    if (!findOneEggHavesting)
      throw new HttpException(
        `EggHavestingId: ${eggHavestingId} doesn't exists, please change`,
        HttpStatus.NOT_FOUND,
      );

    await this.eggHavestingsService.updateOne(
      { eggHavestingId: findOneEggHavesting.id },
      { deletedAt: new Date() },
    );

    await this.activitylogsService.createOne({
      userId: user.id,
      date: new Date(),
      message: `${user.profile?.firstName} ${user.profile?.lastName} deleted an egg havesting`,
      organizationId: user.organizationId,
    });

    return reply({ res, results: 'EggHavesting deleted successfully' });
  }
}
