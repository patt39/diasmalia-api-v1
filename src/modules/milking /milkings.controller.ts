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
import { AnimalsService } from '../animals/animals.service';
import { JwtAuthGuard } from '../users/middleware';
import { CreateOrUpdateMilkingsDto } from './milkings.dto';
import { MilkingsService } from './milkings.service';

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
    const { note, date, quantity, method, femaleCode } = body;

    const findOneFemale = await this.animalsService.findOneBy({
      code: femaleCode,
      gender: 'FEMALE',
      status: 'ACTIVE',
      productionPhase: 'LACTATION',
      organizationId: user.organizationId,
    });
    if (!findOneFemale) {
      throw new HttpException(
        `Animal ${femaleCode} doesn't exists, isn't in LACTATION phase, isn't a FEMALE or isn't ACTIVE please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    const milking = await this.milkingsService.createOne({
      note,
      date,
      method,
      quantity,
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
    const { note, date, quantity, method, femaleCode } = body;

    const findOneMilking = await this.milkingsService.findOneBy({
      milkingId,
      organizationId: user.organizationId,
    });
    if (!findOneMilking) {
      throw new HttpException(
        `${milkingId} doesn't exists, please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    const findOneFemale = await this.animalsService.findOneBy({
      code: femaleCode,
      gender: 'FEMALE',
      status: 'ACTIVE',
      productionPhase: 'LACTATION',
      organizationId: user.organizationId,
    });
    if (!findOneFemale) {
      throw new HttpException(
        `Animal ${femaleCode} doesn't exists, isn't in LACTATION phase, isn't a FEMALE or isn't ACTIVE please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    const milking = await this.milkingsService.updateOne(
      { milkingId },
      {
        note,
        date,
        method,
        quantity,
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
  async getOneByIdMilking(
    @Res() res,
    @Req() req,
    @Query('milkingId', ParseUUIDPipe) milkingId: string,
  ) {
    const { user } = req;
    const findOneMilking = await this.milkingsService.findOneBy({
      milkingId,
      organizationId: user.organizationId,
    });
    if (!findOneMilking) {
      throw new HttpException(
        `${milkingId} doesn't exists, please change`,
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
    @Req() req,
    @Param('milkingId', ParseUUIDPipe) milkingId: string,
  ) {
    const { user } = req;

    const findOneMilking = await this.milkingsService.findOneBy({
      milkingId,
      organizationId: user.organizationId,
    });
    if (!findOneMilking) {
      throw new HttpException(
        `${milkingId} doesn't exists, please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    await this.milkingsService.updateOne(
      { milkingId },
      { deletedAt: new Date() },
    );

    return reply({ res, results: findOneMilking });
  }
}
