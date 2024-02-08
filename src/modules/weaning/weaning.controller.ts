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
import { FarrowingsService } from '../farrowings/farrowings.service';
import { JwtAuthGuard } from '../users/middleware';
import { CreateOrUpdateWeaningsDto } from './weaning.dto';
import { WeaningsService } from './weaning.service';

@Controller('weanings')
export class WeaningsController {
  constructor(
    private readonly weaningsService: WeaningsService,
    private readonly animalsService: AnimalsService,
    private readonly farrowingsService: FarrowingsService,
  ) {}

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

    const weanings = await this.weaningsService.findAll({
      search,
      pagination,
      organizationId: user?.organizationId,
    });

    return reply({ res, results: weanings });
  }

  /** Post one weaning */
  @Post(`/`)
  @UseGuards(JwtAuthGuard)
  async createOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateWeaningsDto,
  ) {
    const { user } = req;
    const { litter, date, note, codeFemale, farrowingId } = body;

    const findOneFemale = await this.animalsService.findOneBy({
      code: codeFemale,
      gender: 'FEMALE',
      status: 'ACTIVE',
      productionPhase: 'LACTATION',
      organizationId: user.organizationId,
    });
    if (!findOneFemale) {
      throw new HttpException(
        `Female animal ${codeFemale} doesn't exists, isn't in LACTATION phase  or isn't ACTIVE please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    const findOneFarrowing = await this.farrowingsService.findOneBy({
      farrowingId,
      organizationId: user.organizationId,
    });
    if (!findOneFarrowing) {
      throw new HttpException(
        `${farrowingId} doesn't exists, please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    const weaning = await this.weaningsService.createOne({
      note,
      date,
      litter,
      animalId: findOneFemale.id,
      farrowingId: findOneFarrowing.id,
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
    });

    return reply({ res, results: weaning });
  }

  /** Update one Weaning */
  @Put(`/:weaningId`)
  @UseGuards(JwtAuthGuard)
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateWeaningsDto,
    @Param('weaningId', ParseUUIDPipe) weaningId: string,
  ) {
    const { user } = req;
    const { litter, date, note, codeFemale, farrowingId } = body;

    const findOneWeaning = await this.weaningsService.findOneBy({
      weaningId,
      organizationId: user.organizationId,
    });
    if (!findOneWeaning) {
      throw new HttpException(
        `${weaningId} doesn't exists, please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    const findOneFemale = await this.animalsService.findOneBy({
      code: codeFemale,
      gender: 'FEMALE',
      status: 'ACTIVE',
      productionPhase: 'LACTATION',
      organizationId: user.organizationId,
    });
    if (!findOneFemale) {
      throw new HttpException(
        `Female animal ${codeFemale} doesn't exists, isn't in LACTATION phase  or isn't ACTIVE please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    const findOneFarrowing = await this.farrowingsService.findOneBy({
      farrowingId,
      organizationId: user.organizationId,
    });
    if (!findOneFarrowing) {
      throw new HttpException(
        `${farrowingId} doesn't exists, please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    const weaning = await this.weaningsService.updateOne(
      { weaningId },
      {
        note,
        date,
        litter,
        animalId: findOneFemale.id,
        farrowingId: findOneFarrowing.id,
        organizationId: user?.organizationId,
        userCreatedId: user?.id,
        updatedAt: new Date(),
      },
    );

    return reply({ res, results: weaning });
  }

  /** Get one Weaning */
  @Get(`/view`)
  @UseGuards(JwtAuthGuard)
  async getOneByIdWeaning(
    @Res() res,
    @Req() req,
    @Query('weaningId', ParseUUIDPipe) weaningId: string,
  ) {
    const { user } = req;
    const findOneWeaning = await this.weaningsService.findOneBy({
      weaningId,
      organizationId: user.organizationId,
    });
    if (!findOneWeaning) {
      throw new HttpException(
        `${weaningId} doesn't exists, please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    return reply({ res, results: findOneWeaning });
  }

  /** Delete Weaning */
  @Delete(`/delete/:weaningId`)
  @UseGuards(JwtAuthGuard)
  async deleteOne(
    @Res() res,
    @Req() req,
    @Param('weaningId', ParseUUIDPipe) weaningId: string,
  ) {
    const { user } = req;
    const findOneWeaning = await this.weaningsService.findOneBy({
      weaningId,
      organizationId: user.organizationId,
    });
    if (!findOneWeaning) {
      throw new HttpException(
        `${weaningId} doesn't exists, please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    const weaning = await this.weaningsService.updateOne(
      { weaningId },
      { deletedAt: new Date() },
    );

    return reply({ res, results: weaning });
  }
}
