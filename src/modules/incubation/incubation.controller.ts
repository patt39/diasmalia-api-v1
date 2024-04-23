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
import { AssignTypesService } from '../assigne-type/assigne-type.service';
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
    private readonly assignTypesService: AssignTypesService,
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

    const { take, page, sort } = requestPaginationDto;
    const pagination: PaginationType = addPagination({ page, take, sort });

    const eggHavestings = await this.incubationsService.findAll({
      search,
      pagination,
      animalTypeId,
      organizationId: user?.organizationId,
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
    const { quantity, date, dueDate, note } = body;

    const findOneAssignType = await this.assignTypesService.findOneBy({
      status: true,
      organizationId: user?.organizationId,
    });
    if (!findOneAssignType)
      throw new HttpException(
        `AnimalType not assigned please change`,
        HttpStatus.NOT_FOUND,
      );

    const incubation = await this.incubationsService.createOne({
      note,
      date,
      dueDate,
      quantity,
      animalTypeId: findOneAssignType.animalTypeId,
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
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
    const { quantity, date, dueDate, note } = body;

    const findOneIncubation = await this.incubationsService.findOneBy({
      incubationId,
    });
    if (!findOneIncubation)
      throw new HttpException(
        `IncubationId: ${incubationId} doesn't exists, please change`,
        HttpStatus.NOT_FOUND,
      );

    const incubation = await this.incubationsService.updateOne(
      { incubationId: findOneIncubation?.id },
      {
        note,
        date,
        dueDate,
        quantity,
        organizationId: user?.organizationId,
        userCreatedId: user?.id,
      },
    );

    return reply({ res, results: incubation });
  }

  /** Get one incubation */
  @Get(`/view/:incubationId`)
  @UseGuards(UserAuthGuard)
  async getOneByIdWeaning(
    @Res() res,
    @Req() req,
    @Param('incubationId', ParseUUIDPipe) incubationId: string,
  ) {
    const { user } = req;

    const findOneAssignType = await this.assignTypesService.findOneBy({
      status: true,
      organizationId: user?.organizationId,
    });
    if (!findOneAssignType)
      throw new HttpException(
        `AnimalType not assigned please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneIncubation = await this.incubationsService.findOneBy({
      incubationId,
      organizationId: user.organizationId,
      animalTypeId: findOneAssignType.animalTypeId,
    });
    if (!findOneIncubation)
      throw new HttpException(
        `IncubationId: ${incubationId} doesn't exists, please change`,
        HttpStatus.NOT_FOUND,
      );

    return reply({ res, results: findOneIncubation });
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
    const findOneAssignType = await this.assignTypesService.findOneBy({
      status: true,
      organizationId: user?.organizationId,
    });
    if (!findOneAssignType)
      throw new HttpException(
        `AnimalType not assigned please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneIncubation = await this.incubationsService.findOneBy({
      incubationId,
      organizationId: user.organizationId,
      animalTypeId: findOneAssignType.animalTypeId,
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

    return reply({ res, results: 'Incubation deleted successfully' });
  }
}
