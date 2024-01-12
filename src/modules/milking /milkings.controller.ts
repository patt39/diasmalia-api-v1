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

import { MilkingsService } from './milkings.service';
import { SearchQueryDto } from '../../app/utils/search-query/search-query.dto';
import { CreateOrUpdateMilkingsDto } from './milkings.dto';
import { RequestPaginationDto } from '../../app/utils/pagination/request-pagination.dto';
import {
  addPagination,
  PaginationType,
} from '../../app/utils/pagination/with-pagination';
import { JwtAuthGuard } from '../users/middleware';

@Controller('milkings')
export class MilkingsController {
  constructor(private readonly milkingsService: MilkingsService) {}

  /** Get all Milkings */
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

    const milkings = await this.milkingsService.findAll({
      search,
      pagination,
      organizationId: user?.organizationId,
    });

    return reply({ res, results: milkings });
  }

  /** Post one Milkings */
  @Post(`/`)
  @UseGuards(JwtAuthGuard)
  async createOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateMilkingsDto,
  ) {
    const { user } = req;
    const { note, date, quantity, method, animalId } = body;

    const milking = await this.milkingsService.createOne({
      note,
      date,
      quantity,
      method,
      animalId,
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
    });

    return reply({ res, results: milking });
  }

  /** Post one Medications */
  @Put(`/:milkingId`)
  @UseGuards(JwtAuthGuard)
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateMilkingsDto,
    @Param('milkingId', ParseUUIDPipe) milkingId: string,
  ) {
    const { user } = req;
    const { note, date, quantity, method, animalId } = body;

    const milking = await this.milkingsService.updateOne(
      { milkingId },
      {
        note,
        date,
        quantity,
        method,
        animalId,
        organizationId: user?.organizationId,
        userCreatedId: user?.id,
      },
    );

    return reply({ res, results: milking });
  }

  /** Get one Medications */
  @Get(`/view`)
  @UseGuards(JwtAuthGuard)
  async getOneByIdUser(
    @Res() res,
    @Query('milkingId', ParseUUIDPipe) milkingId: string,
  ) {
    const milking = await this.milkingsService.findOneBy({
      milkingId,
    });

    return reply({ res, results: milking });
  }

  /** Delete one Medications */
  @Delete(`/delete/:milkingId`)
  @UseGuards(JwtAuthGuard)
  async deleteOne(
    @Res() res,
    @Param('milkingId', ParseUUIDPipe) milkingId: string,
  ) {
    const milking = await this.milkingsService.updateOne(
      { milkingId },
      { deletedAt: new Date() },
    );

    return reply({ res, results: milking });
  }
}
