import {
  Body,
  Controller,
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
import { RequestPaginationDto } from '../../app/utils/pagination/request-pagination.dto';
import {
  addPagination,
  PaginationType,
} from '../../app/utils/pagination/with-pagination';
import { reply } from '../../app/utils/reply';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { AssignTypesService } from '../assigne-type/assigne-type.service';
import { UserAuthGuard } from '../users/middleware';
import { CreateHealthsDto, GetHealthQueryDto } from './health.dto';
import { HealthsService } from './health.service';

@Controller('health')
export class HealthsController {
  constructor(
    private readonly healthsService: HealthsService,
    private readonly assignTypesService: AssignTypesService,
    private readonly activitylogsService: ActivityLogsService,
  ) {}

  /** Get health */
  @Get(`/`)
  @UseGuards(UserAuthGuard)
  async findAll(
    @Res() res,
    @Req() req,
    @Query() requestPaginationDto: RequestPaginationDto,
    @Query() queryFeeding: GetHealthQueryDto,
  ) {
    const { user } = req;
    const { animalTypeId, category, status } = queryFeeding;

    const { take, page, sort, sortBy } = requestPaginationDto;
    const pagination: PaginationType = addPagination({
      page,
      take,
      sort,
      sortBy,
    });

    const health = await this.healthsService.findAll({
      status,
      category,
      pagination,
      animalTypeId,
      organizationId: user?.organizationId,
    });

    return reply({ res, results: health });
  }

  /** Post one health */
  @Post(`/create`)
  @UseGuards(UserAuthGuard)
  async createOne(@Res() res, @Req() req, @Body() body: CreateHealthsDto) {
    const { user } = req;
    const { name, category, animalTypeId } = body;

    const findOneAssignType = await this.assignTypesService.findOneBy({
      animalTypeId,
      organizationId: user?.organizationId,
    });
    if (!findOneAssignType)
      throw new HttpException(
        `Animal Type not assigned please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneHealth = await this.healthsService.findOneBy({
      name,
      organizationId: user?.organizationId,
      animalTypeId: findOneAssignType?.animalTypeId,
    });
    if (findOneHealth)
      throw new HttpException(
        `Health ${name} already created please update`,
        HttpStatus.NOT_FOUND,
      );

    const health = await this.healthsService.createOne({
      name,
      category,
      animalTypeId: findOneAssignType?.animalTypeId,
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
    });

    await this.activitylogsService.createOne({
      userId: user?.id,
      message: `${user?.profile?.firstName} ${user?.profile?.lastName} added ${name} in feed stock for ${findOneAssignType?.animalType?.name} `,
      organizationId: user?.organizationId,
    });

    return reply({
      res,
      results: {
        status: HttpStatus.CREATED,
        data: health,
        message: `Health Created Successfully`,
      },
    });
  }

  /** Change status */
  @Put(`/:healthId/change-status`)
  @UseGuards(UserAuthGuard)
  async changeStatus(
    @Res() res,
    @Req() req,
    @Param('healthId', ParseUUIDPipe) healthId: string,
  ) {
    const { user } = req;

    const findOneHealth = await this.healthsService.findOneBy({
      healthId,
      organizationId: user?.organizationId,
    });
    if (!findOneHealth)
      throw new HttpException(
        `Name: ${findOneHealth?.name} doesn't exists please update`,
        HttpStatus.NOT_FOUND,
      );

    await this.healthsService.updateOne(
      { healthId: findOneHealth?.id },
      { status: !findOneHealth?.status },
    );

    return reply({ res, results: 'Status changed successfully' });
  }
}
