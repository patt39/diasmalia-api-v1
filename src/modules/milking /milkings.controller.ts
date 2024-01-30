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
import { CreateOrUpdateMilkingsDto } from './milkings.dto';
import { MilkingsService } from './milkings.service';
import { AnimalsService } from '../animals/animals.service';

@Controller('milkings')
export class MilkingsController {
  constructor(
    private readonly milkingsService: MilkingsService,
    private readonly animalsService: AnimalsService,
  ) {}

  /** Get all milkings */
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

  /** Post one milking */
  @Post(`/`)
  @UseGuards(JwtAuthGuard)
  async createOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateMilkingsDto,
  ) {
    const { user } = req;
    const { note, date, quantity, method, animalId } = body;

    const findOneFemale = await this.animalsService.findOneBy({
      animalId,
      gender: 'FEMALE',
      status: 'ACTIVE',
      productionPhase: 'LACTATION',
      organizationId: user.organizationId,
    });
    if (!findOneFemale) {
      throw new HttpException(
        `Animal ${findOneFemale.code} doesn't exists, isn't in REPRODUCTION phase  or isn't ACTIVE please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    const milking = await this.milkingsService.createOne({
      note,
      date,
      quantity,
      method,
      animalId: findOneFemale.id,
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
    });

    return reply({ res, results: milking });
  }

  /** Update one milking */
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

    const findOneFemale = await this.animalsService.findOneBy({
      animalId,
      gender: 'FEMALE',
      status: 'ACTIVE',
      productionPhase: 'LACTATION',
      organizationId: user.organizationId,
    });
    if (!findOneFemale) {
      throw new HttpException(
        `Animal ${findOneFemale.code} doesn't exists, isn't in REPRODUCTION phase  or isn't ACTIVE please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    const milking = await this.milkingsService.updateOne(
      { milkingId },
      {
        note,
        date,
        quantity,
        method,
        animalId: findOneFemale.id,
        organizationId: user?.organizationId,
        userCreatedId: user?.id,
      },
    );

    return reply({ res, results: milking });
  }

  /** Get one milking */
  @Get(`/view`)
  @UseGuards(JwtAuthGuard)
  async getOneByIdUser(
    @Res() res,
    @Query('milkingId', ParseUUIDPipe) milkingId: string,
  ) {
    const findOneMilking = await this.milkingsService.findOneBy({
      milkingId,
    });
    if (!findOneMilking) {
      throw new HttpException(
        `Animal ${milkingId} doesn't exists, isn't in REPRODUCTION phase  or isn't ACTIVE please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    return reply({ res, results: findOneMilking });
  }

  /** Delete one milking */
  @Delete(`/delete/:milkingId`)
  @UseGuards(JwtAuthGuard)
  async deleteOne(
    @Res() res,
    @Param('milkingId', ParseUUIDPipe) milkingId: string,
  ) {
    const findOneMilking = await this.milkingsService.updateOne(
      { milkingId },
      { deletedAt: new Date() },
    );

    if (!findOneMilking) {
      throw new HttpException(
        `Animal ${milkingId} doesn't exists, isn't in REPRODUCTION phase  or isn't ACTIVE please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    return reply({ res, results: findOneMilking });
  }
}
