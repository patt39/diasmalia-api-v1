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
import { JwtAuthGuard } from '../users/middleware';
import { CreateOrUpdateTasksDto } from './tasks.dto';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly contributorsService: ContributorsService,
  ) {}

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
    const { title, description, dueDate, status, contributorId } = body;

    const findOneContributor = await this.contributorsService.findOneBy({
      contributorId,
      organizationId: user?.organizationId,
    });
    if (!findOneContributor)
      throw new HttpException(
        ` ${contributorId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    if (findOneContributor.role !== 'SUPERADMIN')
      throw new HttpException(
        ` ${contributorId} can't create a task`,
        HttpStatus.NOT_FOUND,
      );

    const task = await this.tasksService.createOne({
      title,
      dueDate,
      status,
      description,
      contributorId: findOneContributor.id,
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
      organizationId: user?.organizationId,
    });
    if (!findOneContributor)
      throw new HttpException(
        ` ${contributorId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    if (findOneContributor.role !== 'SUPERADMIN')
      throw new HttpException(
        ` ${contributorId} can't create a task`,
        HttpStatus.NOT_FOUND,
      );

    const task = await this.tasksService.updateOne(
      { taskId: findOneTask?.id },
      {
        title,
        dueDate,
        status,
        description,
        contributorId: findOneContributor.id,
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
    const findOneTask = await this.tasksService.findOneBy({ taskId });
    if (!findOneTask) {
      throw new HttpException(
        `Task ${taskId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    return reply({ res, results: findOneTask });
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
