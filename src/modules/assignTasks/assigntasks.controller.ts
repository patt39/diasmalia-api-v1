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
import { TasksService } from '../tasks/tasks.service';
import { JwtAuthGuard } from '../users/middleware';
import { CreateOrUpdateAssignTasksDto } from './assigntasks.dto';
import { AssignTasksService } from './assigntasks.service';
import { UsersService } from '../users/users.service';

@Controller('assigned-tasks')
export class AssignTasksController {
  constructor(
    private readonly assignTasksService: AssignTasksService,
    private readonly usersService: UsersService,
    private readonly tasksService: TasksService,
  ) {}

  /** Get all assignTasks */
  @Get(`/`)
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Res() res,
    @Req() req,
    @Query() requestPaginationDto: RequestPaginationDto,
    @Query() query: SearchQueryDto,
  ) {
    const { user } = req;
    const { search } = query;

    const { take, page, sort } = requestPaginationDto;
    const pagination: PaginationType = addPagination({ page, take, sort });

    const assignTasks = await this.assignTasksService.findAll({
      search,
      pagination,
      organizationId: user?.organizationId,
    });

    return reply({ res, results: assignTasks });
  }

  /** Post one assignedTask */
  @Post(`/`)
  @UseGuards(JwtAuthGuard)
  async createOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateAssignTasksDto,
  ) {
    const { user } = req;
    const { taskId, userId } = body;

    const findOneUser = await this.usersService.findOneBy({
      userId,
      organizationId: user?.organizationId,
    });
    if (!findOneUser)
      throw new HttpException(
        ` ${userId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneTask = await this.tasksService.findOneBy({
      taskId,
      organizationId: user?.organizationId,
    });
    if (!findOneTask)
      throw new HttpException(
        ` ${taskId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const task = await this.assignTasksService.createOne({
      taskId: findOneTask.id,
      userId: findOneUser.id,
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
    });

    return reply({ res, results: task });
  }

  /** Update one assignedTask */
  @Put(`/:assignTaskId`)
  @UseGuards(JwtAuthGuard)
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateAssignTasksDto,
    @Param('assignTaskId', ParseUUIDPipe) assignTaskId: string,
  ) {
    const { user } = req;
    const { taskId, userId } = body;

    const findOneAssignTask = await this.assignTasksService.findOneBy({
      assignTaskId,
      userId,
      organizationId: user.organizationId,
    });
    if (!findOneAssignTask) {
      throw new HttpException(
        `Task ${assignTaskId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }

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

    const findOneUser = await this.usersService.findOneBy({
      userId,
      organizationId: user?.organizationId,
    });
    if (!findOneUser)
      throw new HttpException(
        ` ${userId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const task = await this.assignTasksService.updateOne(
      { assignTaskId: findOneTask?.id },
      {
        taskId: findOneTask.id,
        userId: findOneUser.id,
        organizationId: user?.organizationId,
        userCreatedId: user?.id,
      },
    );

    return reply({ res, results: task });
  }

  /** Get one assignTask */
  @Get(`/view`)
  @UseGuards(JwtAuthGuard)
  async getOneByIdUser(
    @Res() res,
    @Req() req,
    @Query('assignTaskId', ParseUUIDPipe) assignTaskId: string,
  ) {
    const { user } = req;
    const findOneassignTask = await this.assignTasksService.findOneBy({
      assignTaskId,
      organizationId: user.organizationId,
    });
    if (!findOneassignTask) {
      throw new HttpException(
        `${assignTaskId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    return reply({ res, results: findOneassignTask });
  }

  /** Get all contributor assigned tasks */
  @Get(`/:userId`)
  // @UseGuards(JwtAuthGuard)
  async findAllContributorTasks(
    @Res() res,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    const fineOneUser = await this.assignTasksService.findAllTasks({
      userId,
    });

    if (!fineOneUser) {
      throw new HttpException(
        `${userId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    return reply({ res, results: fineOneUser });
  }

  /** Delete one assignTask */
  @Delete(`/delete/:taskId`)
  @UseGuards(JwtAuthGuard)
  async deleteOne(
    @Res() res,
    @Req() req,
    @Param('assignTaskId', ParseUUIDPipe) assignTaskId: string,
  ) {
    const { user } = req;
    const findOneassignTask = await this.assignTasksService.findOneBy({
      assignTaskId,
      organizationId: user.organizationId,
    });
    if (!findOneassignTask) {
      throw new HttpException(
        `${assignTaskId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }
    const task = await this.assignTasksService.updateOne(
      { assignTaskId },
      { deletedAt: new Date() },
    );

    return reply({ res, results: task });
  }
}
