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
import { AssignTypesService } from '../assigne-type/assigne-type.service';
import { ContributorsService } from '../contributors/contributors.service';
import { taskNotification } from '../users/mails/task-notification-mail';
import { UserAuthGuard } from '../users/middleware';
import { CreateOrUpdateTasksDto, TaskQueryDto } from './tasks.dto';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly activitylogsService: ActivityLogsService,
    private readonly contributorsService: ContributorsService,
    private readonly assignTypesService: AssignTypesService,
  ) {}

  /** Get all Tasks */
  @Get(`/`)
  @UseGuards(UserAuthGuard)
  async findAll(
    @Res() res,
    @Req() req,
    @Query() requestPaginationDto: RequestPaginationDto,
    @Query() query: SearchQueryDto,
    @Query() taskQuery: TaskQueryDto,
  ) {
    const { user } = req;
    const { search } = query;
    const { contributorId, animalTypeId, type, status } = taskQuery;

    const { take, page, sort, sortBy } = requestPaginationDto;
    const pagination: PaginationType = addPagination({
      page,
      take,
      sort,
      sortBy,
    });

    const tasks = await this.tasksService.findAll({
      type,
      status,
      search,
      pagination,
      animalTypeId,
      contributorId,
      organizationId: user?.organizationId,
    });

    return reply({ res, results: tasks });
  }

  /** Post one Task */
  @Post(`/create`)
  @UseGuards(UserAuthGuard)
  async createOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateTasksDto,
  ) {
    const { user } = req;
    const {
      type,
      title,
      dueDate,
      periode,
      description,
      contributorId,
      animalTypeId,
      frequency,
    } = body;

    const findOneContributor = await this.contributorsService.findOneBy({
      contributorId,
      organizationId: user?.organizationId,
    });
    if (!findOneContributor)
      throw new HttpException(
        `ContributorId: ${contributorId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneAssignType = await this.assignTypesService.findOneBy({
      animalTypeId,
      organizationId: user?.organizationId,
    });
    if (!findOneAssignType)
      throw new HttpException(
        `AnimalType not assigned please change`,
        HttpStatus.NOT_FOUND,
      );

    const task = await this.tasksService.createOne({
      type,
      title,
      periode,
      frequency,
      description,
      dueDate: dueDate ? new Date(dueDate) : new Date(),
      animalTypeId: findOneAssignType?.animalTypeId,
      contributorId: findOneContributor?.id,
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
    });

    await this.activitylogsService.createOne({
      userId: user?.id,
      organizationId: user?.organizationId,
      message: `${user?.profile?.firstName} ${user?.profile?.lastName} assigned a task to ${findOneContributor?.user?.profile?.firstName} ${findOneContributor?.user?.profile?.lastName}`,
    });

    await taskNotification({
      user,
      email: findOneContributor?.user?.email,
    });

    return reply({ res, results: task });
  }

  /** Update one Task */
  @Put(`/:taskId/edit`)
  @UseGuards(UserAuthGuard)
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateTasksDto,
    @Param('taskId', ParseUUIDPipe) taskId: string,
  ) {
    const { user } = req;
    const {
      type,
      title,
      status,
      periode,
      dueDate,
      frequency,
      description,
      animalTypeId,
      contributorId,
    } = body;

    const findOneTask = await this.tasksService.findOneBy({
      taskId,
      organizationId: user?.organizationId,
    });
    if (!findOneTask) {
      throw new HttpException(
        `Task ${taskId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    const findOneContributor = await this.contributorsService.findOneBy({
      contributorId,
      organizationId: user?.organizationId,
    });
    if (!findOneContributor)
      throw new HttpException(
        `ContributorId: ${contributorId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneAssignType = await this.assignTypesService.findOneBy({
      animalTypeId,
      organizationId: user?.organizationId,
    });
    if (!findOneAssignType)
      throw new HttpException(
        `AnimalType not assigned please change`,
        HttpStatus.NOT_FOUND,
      );

    const task = await this.tasksService.updateOne(
      { taskId: findOneTask?.id },
      {
        type,
        title,
        status,
        dueDate,
        periode,
        frequency,
        description,
        animalTypeId: findOneAssignType?.animalTypeId,
        contributorId: findOneContributor?.id,
        userCreatedId: user?.id,
      },
    );

    await taskNotification({
      user,
      email: findOneContributor?.user?.email,
    });

    await this.activitylogsService.createOne({
      userId: user?.id,
      organizationId: user?.organizationId,
      message: `${user?.profile?.firstName} ${user?.profile?.lastName} updated a task`,
    });

    return reply({ res, results: task });
  }

  /** Get one Task */
  @Get(`/:taskId/show`)
  @UseGuards(UserAuthGuard)
  async viewTask(@Res() res, @Req() req, @Param('taskId') taskId: string) {
    const { user } = req;
    const findOneTask = await this.tasksService.findOneBy({
      taskId,
      organizationId: user?.organizationId,
    });
    if (!findOneTask) {
      throw new HttpException(
        `Task: ${taskId} doesn't exists`,
        HttpStatus.NOT_FOUND,
      );
    }

    return reply({ res, results: findOneTask });
  }

  /** Delete one Task */
  @Delete(`/:taskId/delete`)
  @UseGuards(UserAuthGuard)
  async deleteOne(
    @Res() res,
    @Req() req,
    @Param('taskId', ParseUUIDPipe) taskId: string,
  ) {
    const { user } = req;
    const findOneTask = await this.tasksService.findOneBy({
      taskId,
      organizationId: user?.organizationId,
    });
    if (!findOneTask) {
      throw new HttpException(
        `TaskId: ${taskId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    await this.activitylogsService.createOne({
      userId: user?.id,
      organizationId: user?.organizationId,
      message: `${user?.profile?.firstName} ${user?.profile?.lastName} deleted a task`,
    });

    const task = await this.tasksService.updateOne(
      { taskId: findOneTask?.id },
      { deletedAt: new Date() },
    );

    return reply({ res, results: task });
  }
}
