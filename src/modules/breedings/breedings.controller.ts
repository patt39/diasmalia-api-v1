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

import { BreedingsService } from './breedings.service';
import { SearchQueryDto } from '../../app/utils/search-query/search-query.dto';
import { CreateOrUpdateBreedingsDto } from './breedings.dto';
import { RequestPaginationDto } from '../../app/utils/pagination/request-pagination.dto';
import {
  addPagination,
  PaginationType,
} from '../../app/utils/pagination/with-pagination';
import { JwtAuthGuard } from '../users/middleware';

@Controller('breedings')
export class BreedingsController {
  constructor(private readonly breedingsService: BreedingsService) {}

  /** Get all Breedings */
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

    const breedings = await this.breedingsService.findAll({
      search,
      pagination,
      organizationId: user?.organizationId,
    });

    return reply({ res, results: breedings });
  }

  /** Post one Breedings */
  @Post(`/`)
  @UseGuards(JwtAuthGuard)
  async createOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateBreedingsDto,
  ) {
    const { user } = req;
    const { date, note, method, animalId } = body;

    const breeding = await this.breedingsService.createOne({
      date,
      note,
      method,
      animalId,
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
    });

    return reply({ res, results: breeding });
  }

  /** Post one Breedings */
  @Put(`/:breedingId`)
  @UseGuards(JwtAuthGuard)
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateBreedingsDto,
    @Param('breedingId', ParseUUIDPipe) breedingId: string,
  ) {
    const { user } = req;
    const { date, note, method, animalId } = body;

    const breeding = await this.breedingsService.updateOne(
      { breedingId },
      {
        date,
        note,
        method,
        animalId,
        organizationId: user?.organizationId,
        userCreatedId: user?.id,
      },
    );

    return reply({ res, results: breeding });
  }

  /** Get one Breedings */
  @Get(`/view`)
  @UseGuards(JwtAuthGuard)
  async getOneByIdUser(
    @Res() res,
    @Query('breedingId', ParseUUIDPipe) breedingId: string,
  ) {
    const Breeding = await this.breedingsService.findOneBy({
      breedingId,
    });

    return reply({ res, results: Breeding });
  }

  /** Delete one Breedings */
  @Delete(`/delete/:breedingId`)
  @UseGuards(JwtAuthGuard)
  async deleteOne(
    @Res() res,
    @Param('breedingId', ParseUUIDPipe) breedingId: string,
  ) {
    const breeding = await this.breedingsService.updateOne(
      { breedingId },
      { deletedAt: new Date() },
    );

    return reply({ res, results: breeding });
  }
}
