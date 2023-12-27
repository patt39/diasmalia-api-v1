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

import { FarrowingsService } from './farrowings.service';
import { SearchQueryDto } from '../../app/utils/search-query/search-query.dto';
import { CreateOrUpdateFarrowingsDto } from './farrowings.dto';
import { RequestPaginationDto } from '../../app/utils/pagination/request-pagination.dto';
import {
  addPagination,
  PaginationType,
} from '../../app/utils/pagination/with-pagination';
import { JwtAuthGuard } from '../users/middleware';

@Controller('farrowings')
export class FarrowingsController {
  constructor(private readonly farrowingsService: FarrowingsService) {}

  /** Get all Animals */
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

    const farrowings = await this.farrowingsService.findAll({
      search,
      pagination,
      organizationId: user?.organizationId,
    });

    return reply({ res, results: farrowings });
  }

  /** Post one Animals */
  @Post(`/`)
  @UseGuards(JwtAuthGuard)
  async createOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateFarrowingsDto,
  ) {
    const { user } = req;
    const { litter, note, checkPregnancyId, animalId } = body;

    const farrowing = await this.farrowingsService.createOne({
      litter,
      note,
      checkPregnancyId,
      animalId,
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
    });

    return reply({ res, results: farrowing });
  }

  /** Post one Animals */
  @Put(`/:farrowingId`)
  @UseGuards(JwtAuthGuard)
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateFarrowingsDto,
    @Param('farrowingId', ParseUUIDPipe) farrowingId: string,
  ) {
    const { user } = req;
    const { litter, note, checkPregnancyId, animalId } = body;

    const farrowing = await this.farrowingsService.updateOne(
      { farrowingId },
      {
        litter,
        note,
        checkPregnancyId,
        animalId,
        organizationId: user.organizationId,
        userCreatedId: user?.id,
      },
    );

    return reply({ res, results: farrowing });
  }

  /** Get one Farrowing */
  @Get(`/view`)
  @UseGuards(JwtAuthGuard)
  async getOneByIdUser(
    @Res() res,
    @Query('farrowingId', ParseUUIDPipe) farrowingId: string,
  ) {
    const farrowing = await this.farrowingsService.findOneBy({
      farrowingId,
    });

    return reply({ res, results: farrowing });
  }

  /** Delete one Animals */
  @Delete(`/delete/:farrowingId`)
  @UseGuards(JwtAuthGuard)
  async deleteOne(
    @Res() res,
    @Param('farrowingId', ParseUUIDPipe) farrowingId: string,
  ) {
    const farrowing = await this.farrowingsService.updateOne(
      { farrowingId },
      { deletedAt: new Date() },
    );

    return reply({ res, results: farrowing });
  }
}
