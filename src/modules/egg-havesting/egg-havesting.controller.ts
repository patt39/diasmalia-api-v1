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
  CreateEggHavestingsDto,
  EggHavestingQueryDto,
  UpdateEggHavestingsDto,
} from './egg-havesting.dto';
import { EggHavestingsService } from './egg-havesting.service';

@Controller('egg-harvestings')
export class EggHavestingsController {
  constructor(
    private readonly eggHavestingsService: EggHavestingsService,
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
    const { animalTypeId, periode } = queryEggHavesting;

    const { take, page, sort, sortBy } = requestPaginationDto;
    const pagination: PaginationType = addPagination({
      page,
      take,
      sort,
      sortBy,
    });

    const eggHavestings = await this.eggHavestingsService.findAll({
      search,
      pagination,
      animalTypeId,
      periode: Number(periode),
      organizationId: user.organizationId,
    });

    return reply({ res, results: eggHavestings });
  }

  /** Post one eggHarvesting */
  @Post(`/create`)
  @UseGuards(UserAuthGuard)
  async createOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateEggHavestingsDto,
  ) {
    const { user } = req;
    const { size, quantity, code } = body;

    const findOneAnimal = await this.animalsService.findOneByCode({
      code,
      status: 'ACTIVE',
      productionPhase: 'LAYING',
    });
    if (!findOneAnimal)
      throw new HttpException(
        `Animal ${code} doesn't exists or isn't in LAYING phase`,
        HttpStatus.NOT_FOUND,
      );

    if (findOneAnimal?.quantity === 0)
      throw new HttpException(
        `Unable to collect eggs, animals doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const eggHarvesting = await this.eggHavestingsService.createOne({
      size,
      quantity,
      animalId: findOneAnimal.id,
      animalTypeId: findOneAnimal.animalTypeId,
      organizationId: user.organizationId,
      userCreatedId: user.id,
    });

    await this.animalsService.updateOne(
      { animalId: findOneAnimal.id },
      { productionPhase: 'LAYING' },
    );

    await this.activitylogsService.createOne({
      userId: user.id,
      organizationId: user.organizationId,
      message: `${user.profile?.firstName} ${user.profile?.lastName} created an egg-havesting in ${findOneAnimal.animalType.name} for ${findOneAnimal.code}`,
    });

    return reply({ res, results: eggHarvesting });
  }

  /** Update one EggHarvesting */
  @Put(`/:eggHarvestingId/edit`)
  @UseGuards(UserAuthGuard)
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: UpdateEggHavestingsDto,
    @Param('eggHarvestingId', ParseUUIDPipe) eggHarvestingId: string,
  ) {
    const { user } = req;
    const { size, quantity, code } = body;

    const findOneAnimal = await this.animalsService.findOneByCode({
      code,
    });
    if (!findOneAnimal)
      throw new HttpException(
        `Animal ${code} doesn't exists or isn't in LAYING phase`,
        HttpStatus.NOT_FOUND,
      );

    const findOneEggHavesting = await this.eggHavestingsService.findOneBy({
      eggHarvestingId,
      organizationId: user.organizationId,
    });
    if (!findOneEggHavesting)
      throw new HttpException(
        `EggHarvestingId: ${eggHarvestingId} doesn't exists, please change`,
        HttpStatus.NOT_FOUND,
      );

    const eggHavesting = await this.eggHavestingsService.updateOne(
      { eggHarvestingId: findOneEggHavesting.id },
      {
        size,
        quantity,
        animalId: findOneAnimal.id,
        userCreatedId: user.id,
      },
    );

    await this.activitylogsService.createOne({
      userId: user.id,
      organizationId: user.organizationId,
      message: `${user.profile?.firstName} ${user.profile?.lastName} updated an egg-havesting in ${findOneEggHavesting.animalType.name} for ${findOneEggHavesting.animal.code}`,
    });

    return reply({ res, results: eggHavesting });
  }

  /** Delete eggHarvesting */
  @Delete(`/:eggHarvestingId/delete`)
  @UseGuards(UserAuthGuard)
  async deleteOne(
    @Res() res,
    @Req() req,
    @Param('eggHarvestingId', ParseUUIDPipe) eggHarvestingId: string,
  ) {
    const { user } = req;

    const findOneEggHarvesting = await this.eggHavestingsService.findOneBy({
      eggHarvestingId,
      organizationId: user.organizationId,
    });
    if (!findOneEggHarvesting)
      throw new HttpException(
        `EggHarvestingId: ${eggHarvestingId} doesn't exists, please change`,
        HttpStatus.NOT_FOUND,
      );

    await this.eggHavestingsService.updateOne(
      { eggHarvestingId: findOneEggHarvesting?.id },
      { deletedAt: new Date() },
    );

    await this.activitylogsService.createOne({
      userId: user.id,
      organizationId: user.organizationId,
      message: `${user.profile?.firstName} ${user.profile?.lastName} deleted an egg-havesting ${findOneEggHarvesting.animalType.name} `,
    });

    return reply({ res, results: 'EggHarvesting deleted successfully' });
  }
}
