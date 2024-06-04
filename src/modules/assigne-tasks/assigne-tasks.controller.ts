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
import { ContributorsService } from '../contributors/contributors.service';
import { TasksService } from '../tasks/tasks.service';
import { UserAuthGuard } from '../users/middleware';
import {
  CreateOrUpdateAssignTasksDto,
  GetAssignTasksDto,
} from './assigne-tasks.dto';
import { AssignTasksService } from './assigne-tasks.service';

@Controller('assigned-tasks')
export class AssignTasksController {
  constructor(
    private readonly assignTasksService: AssignTasksService,
    private readonly tasksService: TasksService,
    private readonly activitylogsService: ActivityLogsService,
    private readonly contributorsService: ContributorsService,
  ) {}

  /** Get all assignTasks */
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
    const { taskId } = queryAssigneTasks;

    const { take, page, sort, sortBy } = requestPaginationDto;
    const pagination: PaginationType = addPagination({
      page,
      take,
      sort,
      sortBy,
    });

    const assignTasks = await this.assignTasksService.findAll({
      taskId,
      search,
      pagination,
      organizationId: user?.organizationId,
    });

    return reply({ res, results: assignTasks });
  }

  /** Post one assignedTask */
  @Post(`/new`)
  @UseGuards(UserAuthGuard)
  async createOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateAssignTasksDto,
  ) {
    const { user } = req;
    const { taskId, userId } = body;

    const findOneContributor = await this.contributorsService.findOneBy({
      userId,
      organizationId: user?.organizationId,
    });
    if (!findOneContributor)
      throw new HttpException(
        `ContributorId: ${userId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneTask = await this.tasksService.findOneBy({
      taskId,
      organizationId: user?.organizationId,
    });
    if (!findOneTask)
      throw new HttpException(
        `TaskId: ${taskId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneAssignedTask = await this.assignTasksService.findOneBy({
      organizationId: user?.organizationId,
    });

    const assignTask = !findOneAssignedTask
      ? await this.assignTasksService.createOne({
          taskId: findOneTask?.id,
          userId: findOneContributor?.userId,
          organizationId: user?.organizationId,
          userCreatedId: user?.id,
        })
      : 'Already Created';

    await this.activitylogsService.createOne({
      userId: user.id,
      organizationId: user.organizationId,
      message: `${user.profile?.firstName} ${user.profile?.lastName} assigned a task to ${findOneContributor?.user.profile.firstName}`,
    });

    return reply({
      res,
      results: {
        status: HttpStatus.CREATED,
        data: assignTask,
        message: `Assigned Created Successfully`,
      },
    });
  }

  /** Delete one assignTask */
  @Delete(`/delete/:assignTaskId`)
  @UseGuards(UserAuthGuard)
  async deleteOne(
    @Res() res,
    @Req() req,
    @Param('assignTaskId', ParseUUIDPipe) assignTaskId: string,
  ) {
    const { user } = req;
    const findOneassignTask = await this.assignTasksService.findOneBy({
      assignTaskId,
      organizationId: user?.organizationId,
    });
    if (!findOneassignTask) {
      throw new HttpException(
        `AssigneTaskId: ${assignTaskId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }
    const task = await this.assignTasksService.updateOne(
      { assignTaskId: findOneassignTask?.id },
      { deletedAt: new Date() },
    );

    await this.activitylogsService.createOne({
      userId: user.id,
      organizationId: user.organizationId,
      message: `${user.profile?.firstName} ${user.profile?.lastName} deleted an assigned task`,
    });

    return reply({ res, results: task });
  }
}
