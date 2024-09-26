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

import { formatDDMMYYDate } from '../../app/utils/commons';
import { RequestPaginationDto } from '../../app/utils/pagination/request-pagination.dto';
import {
  addPagination,
  PaginationType,
} from '../../app/utils/pagination/with-pagination';
import { SearchQueryDto } from '../../app/utils/search-query/search-query.dto';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { AnimalsService } from '../animals/animals.service';
import { EggHavestingsService } from '../egg-havesting/egg-havesting.service';
import { UserAuthGuard } from '../users/middleware';
import {
  CreateIncubationsDto,
  IncubationQueryDto,
  UpdateIncubationsDto,
} from './incubation.dto';
import { IncubationsService } from './incubation.service';

@Controller('incubations')
export class IncubationsController {
  constructor(
    private readonly incubationsService: IncubationsService,
    private readonly animalsService: AnimalsService,
    private readonly EggHavestingsService: EggHavestingsService,
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
    const { animalTypeId, periode } = queryIncubation;

    const { take, page, sort, sortBy } = requestPaginationDto;
    const pagination: PaginationType = addPagination({
      page,
      take,
      sort,
      sortBy,
    });

    const incubations = await this.incubationsService.findAll({
      search,
      pagination,
      animalTypeId,
      periode: Number(periode),
      organizationId: user?.organizationId,
    });

    return reply({ res, results: incubations });
  }

  /** Post one incubation */
  @Post(`/create`)
  @UseGuards(UserAuthGuard)
  async createOne(@Res() res, @Req() req, @Body() body: CreateIncubationsDto) {
    const { user } = req;
    const { dueDate, quantityStart, code } = body;

    const findOneAnimal = await this.animalsService.findOneAnimalDetails({
      code,
      productionPhase: 'LAYING',
      organizationId: user?.organizationId,
    });
    if (!findOneAnimal)
      throw new HttpException(
        `Band: ${code} doesn't exists`,
        HttpStatus.NOT_FOUND,
      );

    const difference = Number(quantityStart - findOneAnimal?.eggHarvestedCount);

    if (quantityStart > findOneAnimal?.eggHarvestedCount)
      throw new HttpException(
        `Impossible to create, eggs to incubate are greater than total number of eggs harvested the difference is ${difference}`,
        HttpStatus.NOT_FOUND,
      );

    const incubation = await this.incubationsService.createOne({
      dueDate,
      quantityStart,
      animalId: findOneAnimal?.id,
      animalTypeId: findOneAnimal?.animalTypeId,
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
    });

    await this.animalsService.updateOne(
      { animalId: findOneAnimal?.id },
      {
        eggHarvestedCount:
          findOneAnimal?.eggHarvestedCount - incubation?.quantityStart,
      },
    );

    await this.activitylogsService.createOne({
      userId: user?.id,
      organizationId: user?.organizationId,
      message: `${user?.profile?.firstName} ${user?.profile?.lastName} created an incubation for ${findOneAnimal?.animalType?.name}`,
    });

    return reply({ res, results: incubation });
  }

  /** Update one Incubation */
  @Put(`/:incubationId/edit`)
  @UseGuards(UserAuthGuard)
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: UpdateIncubationsDto,
    @Param('incubationId', ParseUUIDPipe) incubationId: string,
  ) {
    const { user } = req;
    const { quantityEnd, quantityStart, dueDate } = body;

    if (quantityEnd > quantityStart)
      throw new HttpException(
        `QuantityEnd: ${quantityEnd} can't be greater than quantityStart: ${quantityStart}`,
        HttpStatus.AMBIGUOUS,
      );

    const findOneIncubation = await this.incubationsService.findOneBy({
      incubationId,
      organizationId: user?.organizationId,
    });
    if (!findOneIncubation)
      throw new HttpException(
        `IncubationId: ${incubationId} doesn't exists, please change`,
        HttpStatus.NOT_FOUND,
      );

    if (formatDDMMYYDate(dueDate) !== formatDDMMYYDate(new Date()))
      throw new HttpException(
        `Impossible to create, hatching date: ${formatDDMMYYDate(dueDate)} not reached yet please update`,
        HttpStatus.NOT_FOUND,
      );

    const incubation = await this.incubationsService.updateOne(
      { incubationId: findOneIncubation?.id },
      {
        dueDate,
        quantityEnd,
        quantityStart,
        userCreatedId: user?.id,
      },
    );

    await this.activitylogsService.createOne({
      userId: user?.id,
      organizationId: user?.organizationId,
      message: `${user?.profile?.firstName} ${user?.profile?.lastName} updated an incubation in ${findOneIncubation?.animalType?.name}`,
    });

    return reply({ res, results: incubation });
  }

  /** Get one incubation */
  @Get(`/:incubationId/view`)
  @UseGuards(UserAuthGuard)
  async getOneByIdGestation(
    @Res() res,
    @Req() req,
    @Param('incubationId', ParseUUIDPipe) incubationId: string,
  ) {
    const { user } = req;

    const findOneIncubation = await this.incubationsService.findOneBy({
      incubationId,
      organizationId: user?.organization,
    });
    if (!findOneIncubation) {
      throw new HttpException(
        `IncubationId: ${incubationId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    return reply({ res, results: findOneIncubation });
  }

  /** Delete Incubation */
  @Delete(`/:incubationId/delete`)
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
      { incubationId: findOneIncubation?.id },
      { deletedAt: new Date() },
    );

    await this.activitylogsService.createOne({
      userId: user?.id,
      organizationId: user?.organizationId,
      message: `${user?.profile?.firstName} ${user?.profile?.lastName} deleted an incubation in ${findOneIncubation?.animalType?.name}`,
    });

    return reply({ res, results: 'Incubation deleted successfully' });
  }
}
