import {
  Controller,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  Delete,
  Res,
  Req,
  Get,
  Query,
  UseGuards,
  Put,
} from '@nestjs/common';
import { reply } from '../../app/utils/reply';

import { TasksService } from './tasks.service';
import { SearchQueryDto } from '../../app/utils/search-query/search-query.dto';
import { CreateOrUpdateTasksDto } from './tasks.dto';
import { RequestPaginationDto } from '../../app/utils/pagination/request-pagination.dto';
import {
  addPagination,
  PaginationType,
} from '../../app/utils/pagination/with-pagination';
import { JwtAuthGuard } from '../users/middleware';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  /** Get all Tasks */
  @Get(`/`)
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Res() res,
    @Query() requestPaginationDto: RequestPaginationDto,
    @Query() query: SearchQueryDto,
  ) {
    const { search } = query;

    const { take, page, sort } = requestPaginationDto;
    const pagination: PaginationType = addPagination({ page, take, sort });

    const tasks = await this.tasksService.findAll({
      search,
      pagination,
    });

    return reply({ res, results: tasks });
  }

  /** Post one Tasks */
  @Post(`/`)
  @UseGuards(JwtAuthGuard)
  async createOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateTasksDto,
  ) {
    const { user } = req;
    const { title, description, dueDate, userId } = body;

    const task = await this.tasksService.createOne({
      title,
      description,
      dueDate,
      userId,
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
    });

    return reply({ res, results: task });
  }

  /** Post one Tasks */
  @Put(`/:taskId`)
  @UseGuards(JwtAuthGuard)
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateTasksDto,
    @Param('taskId', ParseUUIDPipe) taskId: string,
  ) {
    const { user } = req;
    const { title, description, dueDate, userId } = body;

    const task = await this.tasksService.updateOne(
      { taskId },
      {
        title,
        description,
        dueDate,
        userId,
        organizationId: user?.organizationId,
        userCreatedId: user?.id,
      },
    );

    return reply({ res, results: task });
  }

  /** Get one Tasks */
  @Get(`/show/:taskId`)
  @UseGuards(JwtAuthGuard)
  async getOneByIdUser(
    @Res() res,
    @Param('taskId', ParseUUIDPipe) taskId: string,
  ) {
    const task = await this.tasksService.findOneBy({ taskId });

    return reply({ res, results: task });
  }

  /** Delete one Tasks */
  @Delete(`/delete/:taskId`)
  // @UseGuards(JwtAuthGuard)
  async deleteOne(@Res() res, @Param('taskId', ParseUUIDPipe) taskId: string) {
    const task = await this.tasksService.updateOne(
      { taskId },
      { deletedAt: new Date() },
    );

    return reply({ res, results: task });
  }
}
