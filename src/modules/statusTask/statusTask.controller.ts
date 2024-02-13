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
import { CreateOrUpdateStatusTasksDto } from './statusTask.dto';
import { StatusTaskService } from './statusTask.service';

@Controller('diagnosis')
export class StatusTaskController {
  constructor(private readonly statusTaskService: StatusTaskService) {}

  /** Get all statusTask */
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

    const statusTask = await this.statusTaskService.findAll({
      search,
      pagination,
      organizationId: user?.organizationId,
    });

    return reply({ res, results: statusTask });
  }

  /** Post one statusTask */
  @Post(`/`)
  @UseGuards(JwtAuthGuard)
  async createOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateStatusTasksDto,
  ) {
    const { user } = req;
    const { name } = body;

    const statusTask = await this.statusTaskService.createOne({
      name,
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
    });

    return reply({ res, results: statusTask });
  }

  /** Update one statusTask */
  @Put(`/:statusTaskId`)
  @UseGuards(JwtAuthGuard)
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateStatusTasksDto,
    @Param('statusTaskId', ParseUUIDPipe) statusTaskId: string,
  ) {
    const { user } = req;
    const { name } = body;

    const findOneStatus = await this.statusTaskService.findOneBy({
      statusTaskId,
    });

    if (!findOneStatus) {
      throw new HttpException(
        `${statusTaskId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    await this.statusTaskService.updateOne(
      { statusTaskId },
      {
        name,
        organizationId: user?.organizationId,
        userCreatedId: user?.id,
      },
    );

    return reply({ res, results: findOneStatus });
  }

  /** Get one statusTask */
  @Get(`/view`)
  @UseGuards(JwtAuthGuard)
  async getOneByIdUser(
    @Res() res,
    @Query('statusTaskId', ParseUUIDPipe) statusTaskId: string,
  ) {
    const findOneStatus = await this.statusTaskService.findOneBy({
      statusTaskId,
    });

    if (!findOneStatus) {
      throw new HttpException(
        `${statusTaskId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    return reply({ res, results: findOneStatus });
  }

  /** Delete one statusTask */
  @Delete(`/delete/:statusTaskId`)
  @UseGuards(JwtAuthGuard)
  async deleteOne(
    @Res() res,
    @Param('statusTaskId', ParseUUIDPipe) statusTaskId: string,
  ) {
    const findOneStatus = await this.statusTaskService.updateOne(
      { statusTaskId },
      { deletedAt: new Date() },
    );

    if (!findOneStatus) {
      throw new HttpException(
        `${statusTaskId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    return reply({ res, results: findOneStatus });
  }
}
