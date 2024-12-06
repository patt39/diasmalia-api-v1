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
  GetAssignTypesDto,
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
    @Query() queryAssigneTypes: GetAssignTypesDto,
  ) {
    const { user } = req;
    const { search } = query;
    const { animalTypeId } = queryAssigneTypes;

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

  /** Post multiple assigne types */
  @Post(`/multiple/create`)
  @UseGuards(UserAuthGuard)
  async createOneBulk(
    @Res() res,
    @Req() req,
    @Body() body: BulkCreateAssignTypesDto,
  ) {
    const { user } = req;
    const { animalTypeIds } = body;

    if (animalTypeIds.lenght === 0)
      throw new HttpException(`Please select a type`, HttpStatus.NOT_FOUND);

    for (const animalTypeId of animalTypeIds) {
      const findOneType = await this.animalTypesService.findOneBy({
        animalTypeId,
      });
      if (!findOneType)
        throw new HttpException(
          `AnimalTypeId: ${animalTypeId} doesn't exists please change`,
          HttpStatus.NOT_FOUND,
        );

      const findOneAssignedType = await this.assignTypesService.findOneBy({
        animalTypeId,
        organizationId: user?.organizationId,
      });
      if (!findOneAssignedType) {
        await this.assignTypesService.createOne({
          userId: user?.id,
          animalTypeId: findOneType?.id,
          organizationId: user?.organizationId,
          userCreatedId: user?.id,
        });
      }
      if (findOneAssignedType)
        throw new HttpException(
          `AnimalTypeId: ${animalTypeId} already assigned please change`,
          HttpStatus.NOT_FOUND,
        );

      await this.activitylogsService.createOne({
        userId: user?.id,
        organizationId: user?.organizationId,
        message: `${user?.profile?.firstName} ${user?.profile?.lastName} assigned animal type: ${findOneType?.name} in your organization `,
      });
    }

    return reply({ res, results: 'Saved' });
  }

  /** Delete one assignType */
  @Delete(`/:assignTypeId/delete`)
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
      message: `${user.profile?.firstName} ${user.profile?.lastName} deleted ${findOneAssignType.animalType?.name} in your organization `,
    });

    return reply({ res, results: assignType });
  }
}
