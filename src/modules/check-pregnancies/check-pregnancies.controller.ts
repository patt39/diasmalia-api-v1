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

import { CheckPregnanciesService } from './check-pregnancies.service';
import { SearchQueryDto } from '../../app/utils/search-query/search-query.dto';
import { CreateOrUpdateCheckPregnanciesDto } from './check-pregnancies.dto';
import { RequestPaginationDto } from '../../app/utils/pagination/request-pagination.dto';
import {
  addPagination,
  PaginationType,
} from '../../app/utils/pagination/with-pagination';
import { JwtAuthGuard } from '../users/middleware';

@Controller('check-pregnancies')
export class CheckPregnanciesController {
  constructor(
    private readonly checkPregnanciesService: CheckPregnanciesService,
  ) {}

  /** Get all CheckPregnancies */
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

    const CheckPregnancies = await this.checkPregnanciesService.findAll({
      search,
      pagination,
      organizationId: user?.organizationId,
    });

    return reply({ res, results: CheckPregnancies });
  }

  /** Post one CheckPregnancies */
  @Post(`/`)
  @UseGuards(JwtAuthGuard)
  async createOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateCheckPregnanciesDto,
  ) {
    const { user } = req;
    const { date, note, farrowingDate, method, result, breedingId } = body;

    const breeding = await this.checkPregnanciesService.createOne({
      date,
      note,
      farrowingDate,
      method,
      result,
      breedingId,
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
    });

    return reply({ res, results: breeding });
  }

  /** Post one CheckPregnancies */
  @Put(`/:checkPregnancyId`)
  @UseGuards(JwtAuthGuard)
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateCheckPregnanciesDto,
    @Param('checkPregnancyId', ParseUUIDPipe) checkPregnancyId: string,
  ) {
    const { user } = req;
    const { date, note, farrowingDate, method, result, breedingId } = body;

    const breeding = await this.checkPregnanciesService.updateOne(
      { checkPregnancyId },
      {
        date,
        note,
        farrowingDate,
        method,
        result,
        breedingId,
        organizationId: user?.organizationId,
        userCreatedId: user?.id,
      },
    );

    return reply({ res, results: breeding });
  }

  /** Get one CheckPregnancies */
  @Get(`/view`)
  @UseGuards(JwtAuthGuard)
  async getOneByIdUser(
    @Res() res,
    @Query('checkPregnancyId', ParseUUIDPipe) checkPregnancyId: string,
  ) {
    const checkPregnancy = await this.checkPregnanciesService.findOneBy({
      checkPregnancyId,
    });

    return reply({ res, results: checkPregnancy });
  }

  /** Delete one CheckPregnancies */
  @Delete(`/delete/:checkPregnancyId`)
  @UseGuards(JwtAuthGuard)
  async deleteOne(
    @Res() res,
    @Param('checkPregnancyId', ParseUUIDPipe) checkPregnancyId: string,
  ) {
    const checkPregnancy = await this.checkPregnanciesService.updateOne(
      { checkPregnancyId },
      { deletedAt: new Date() },
    );

    return reply({ res, results: checkPregnancy });
  }
}
