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
import { JwtAuthGuard } from '../users/middleware';
import { CreateOrUpdateTasksDto } from './tasks.dto';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  /** Get all Tasks */
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

    const tasks = await this.tasksService.findAll({
      search,
      pagination,
      organizationId: user?.organizationId,
    });

    return reply({ res, results: tasks });
  }

  /** Post one Task */
  @Post(`/`)
  @UseGuards(JwtAuthGuard)
  async createOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateTasksDto,
  ) {
    const { user } = req;
    const { title, description, dueDate, statusTaskId } = body;

    const task = await this.tasksService.createOne({
      title,
      description,
      dueDate,
      statusTaskId,
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
    });

    return reply({ res, results: task });
  }

  /** Post one Task */
  @Put(`/:taskId`)
  @UseGuards(JwtAuthGuard)
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateTasksDto,
    @Param('taskId', ParseUUIDPipe) taskId: string,
  ) {
    const { user } = req;
    const { title, description, dueDate, statusTaskId } = body;

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

    const task = await this.tasksService.updateOne(
      { taskId: findOneTask?.id },
      {
        title,
        description,
        dueDate,
        statusTaskId,
        organizationId: user?.organizationId,
        userCreatedId: user?.id,
      },
    );

    return reply({ res, results: task });
  }

  /** Get one Task */
  @Get(`/view`)
  @UseGuards(JwtAuthGuard)
  async getOneByIdUser(
    @Res() res,
    @Query('taskId', ParseUUIDPipe) taskId: string,
  ) {
    const task = await this.tasksService.findOneBy({ taskId });

    return reply({ res, results: task });
  }

  /** Delete one Task */
  @Delete(`/delete/:taskId`)
  @UseGuards(JwtAuthGuard)
  async deleteOne(@Res() res, @Param('taskId', ParseUUIDPipe) taskId: string) {
    const findOneTask = await this.tasksService.findOneBy({
      taskId,
    });
    if (!findOneTask) {
      throw new HttpException(
        `Task ${taskId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }
    const task = await this.tasksService.updateOne(
      { taskId },
      { deletedAt: new Date() },
    );

    return reply({ res, results: task });
  }
}
