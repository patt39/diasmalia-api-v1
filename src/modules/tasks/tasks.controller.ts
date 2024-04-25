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
import { ContributorsService } from '../contributors/contributors.service';
import { taskNotification } from '../users/mails/task-notification-mail';
import { UserAuthGuard } from '../users/middleware';
import { CreateOrUpdateTasksDto, TasksQueryDto } from './tasks.dto';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly contributorsService: ContributorsService,
  ) {}

  /** Get all Tasks */
  @Get(`/`)
  @UseGuards(UserAuthGuard)
  async findAll(
    @Res() res,
    @Req() req,
    @Query() requestPaginationDto: RequestPaginationDto,
    @Query() query: SearchQueryDto,
    @Query() queryTasks: TasksQueryDto,
  ) {
    const { user } = req;
    const { search } = query;
    const { status } = queryTasks;

    const { take, page, sort } = requestPaginationDto;
    const pagination: PaginationType = addPagination({ page, take, sort });

    const tasks = await this.tasksService.findAll({
      status,
      search,
      pagination,
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
    const { title, description, dueDate, contributorId } = body;

    const findOneContributor = await this.contributorsService.findOneBy({
      contributorId,
      organizationId: user.organizationId,
    });
    if (!findOneContributor)
      throw new HttpException(
        `ContributorId: ${contributorId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    if (findOneContributor.role === 'ADMIN')
      throw new HttpException(
        `ContributorId: ${contributorId} can't create a task`,
        HttpStatus.NOT_FOUND,
      );

    const task = await this.tasksService.createOne({
      title,
      dueDate,
      description,
      contributorId: findOneContributor.id,
      organizationId: user.organizationId,
      userCreatedId: user?.id,
    });

    await taskNotification({
      email: findOneContributor.user.email,
      user,
      slug: task.slug,
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
    const { title, description, dueDate, status, contributorId } = body;

    const findOneTask = await this.tasksService.findOneBy({
      taskId,
      organizationId: user.organizationId,
    });
    if (!findOneTask) {
      throw new HttpException(
        `Task ${taskId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    const findOneContributor = await this.contributorsService.findOneBy({
      contributorId,
      organizationId: user.organizationId,
    });
    if (!findOneContributor)
      throw new HttpException(
        `ContributorId: ${contributorId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    if (
      findOneContributor.role === 'ADMIN' &&
      findOneTask.userCreatedId !== user.id
    )
      throw new HttpException(
        `ContributorId: ${contributorId} can't update this task`,
        HttpStatus.NOT_FOUND,
      );

    const task = await this.tasksService.updateOne(
      { taskId: findOneTask?.id },
      {
        title,
        status,
        dueDate,
        description,
        contributorId: findOneContributor.id,
        userCreatedId: user.id,
      },
    );

    return reply({ res, results: task });
  }

  /** Get one Task */
  @Get(`/:slug/show`)
  @UseGuards(UserAuthGuard)
  async getOneByIdUser(@Res() res, @Req() req, @Param('slug') slug: string) {
    const { user } = req;
    const findOneTask = await this.tasksService.findOneBy({
      slug,
      organizationId: user?.organizationId,
    });
    if (!findOneTask) {
      throw new HttpException(
        `Task: ${slug} doesn't exists`,
        HttpStatus.NOT_FOUND,
      );
    }

    return reply({ res, results: findOneTask });
  }

  /** Delete one Task */
  @Delete(`/delete/:taskId`)
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
    const task = await this.tasksService.updateOne(
      { taskId: findOneTask?.id },
      { deletedAt: new Date() },
    );

    return reply({ res, results: task });
  }
}
