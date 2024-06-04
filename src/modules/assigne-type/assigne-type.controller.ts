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
import { AnimalTypesService } from '../animal-type/animal-type.service';
import { UserAuthGuard } from '../users/middleware';
import {
  BulkCreateAssignTypesDto,
  CreateOrUpdateAssignTypesDto,
  GetAssignTasksDto,
} from './assigne-type.dto';
import { AssignTypesService } from './assigne-type.service';

@Controller('assigned-type')
export class AssignTypesController {
  constructor(
    private readonly assignTypesService: AssignTypesService,
    private readonly animalTypesService: AnimalTypesService,
    private readonly activitylogsService: ActivityLogsService,
  ) {}

  /** Get all assignTypes */
  @Get(`/`)
  @UseGuards(UserAuthGuard)
  async findAll(
    @Res() res,
    @Req() req,
    @Query() requestPaginationDto: RequestPaginationDto,
    @Query() query: SearchQueryDto,
    @Query() queryAssigneTasks: GetAssignTasksDto,
  ) {
    const { user } = req;
    const { search } = query;
    const { animalTypeId } = queryAssigneTasks;

    const { take, page, sort, sortBy } = requestPaginationDto;
    const pagination: PaginationType = addPagination({
      page,
      take,
      sort,
      sortBy,
    });

    const assignTypes = await this.assignTypesService.findAll({
      search,
      pagination,
      animalTypeId,
      organizationId: user?.organizationId,
    });

    return reply({ res, results: assignTypes });
  }

  /** Post one assignedType */
  @Post(`/`)
  @UseGuards(UserAuthGuard)
  async createOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateAssignTypesDto,
  ) {
    const { user } = req;
    const { animalTypeId } = body;

    const findOneType = await this.animalTypesService.findOneBy({
      animalTypeId,
    });
    if (!findOneType)
      throw new HttpException(
        `AnimalTypeId: ${animalTypeId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneAnimalType = await this.assignTypesService.findOneBy({
      animalTypeId,
      organizationId: user.organizationId,
    });
    if (!findOneAnimalType) {
      await this.assignTypesService.createOne({
        userId: user.id,
        animalTypeId: findOneType.id,
        organizationId: user.organizationId,
        userCreatedId: user?.id,
      });
    }

    await this.activitylogsService.createOne({
      userId: user.id,
      organizationId: user.organizationId,
      message: `${user.profile?.firstName} ${user.profile?.lastName} assigned a new animal type in your organization `,
    });

    return reply({
      res,
      results: {
        status: HttpStatus.CREATED,
        message: `Animal Type assigned successfully`,
      },
    });
  }

  /** Post one multiple select assigne type */
  @Post(`/multiple/create`)
  @UseGuards(UserAuthGuard)
  async createOneBulk(
    @Res() res,
    @Req() req,
    @Body() body: BulkCreateAssignTypesDto,
  ) {
    const { user } = req;
    const { animalTypeIds } = body;

    for (const animalTypeId of animalTypeIds) {
      const findOneType = await this.animalTypesService.findOneBy({
        animalTypeId,
      });
      if (!findOneType)
        throw new HttpException(
          `AnimalTypeId: ${animalTypeId} doesn't exists please change`,
          HttpStatus.NOT_FOUND,
        );

      await this.assignTypesService.createOne({
        userId: user.id,
        animalTypeId: findOneType.id,
        organizationId: user.organizationId,
        userCreatedId: user.id,
      });
    }

    return reply({ res, results: 'Saved' });
  }

  /** View animal type */
  @Get(`/view/:assignTypeId`)
  @UseGuards(UserAuthGuard)
  async openAnimalType(
    @Res() res,
    @Req() req,
    @Param('assignTypeId', ParseUUIDPipe) assignTypeId: string,
  ) {
    const { user } = req;

    const findOneAssignType = await this.assignTypesService.findOneBy({
      assignTypeId,
      organizationId: user.organizationId,
    });
    if (!findOneAssignType)
      throw new HttpException(
        `AssigneTypeId: ${assignTypeId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    return reply({ res, results: 'Animal type opened' });
  }

  /** Delete one assignType */
  @Delete(`/delete/:assignTypeId`)
  @UseGuards(UserAuthGuard)
  async deleteOne(
    @Res() res,
    @Req() req,
    @Param('assignTypeId', ParseUUIDPipe) assignTypeId: string,
  ) {
    const { user } = req;
    const findOneAssignType = await this.assignTypesService.findOneBy({
      assignTypeId,
      organizationId: user?.organizationId,
    });
    if (!findOneAssignType) {
      throw new HttpException(
        `AssigneTaskId: ${assignTypeId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }
    const assignType = await this.assignTypesService.updateOne(
      { assignTypeId: findOneAssignType.id },
      { deletedAt: new Date() },
    );

    await this.activitylogsService.createOne({
      userId: user.id,
      organizationId: user.organizationId,
      message: `${user.profile?.firstName} ${user.profile?.lastName} deleted an animal type in your organization `,
    });

    return reply({ res, results: assignType });
  }
}
