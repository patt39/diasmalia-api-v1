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
import { UserAuthGuard } from '../users/middleware';
import { CreateOrUpdateFarrowingsDto } from './farrowings.dto';
import { FarrowingsService } from './farrowings.service';

@Controller('farrowings')
export class FarrowingsController {
  constructor(
    private readonly farrowingsService: FarrowingsService,
    private readonly animalsService: AnimalsService,
  ) {}

  /** Get all farrowings */
  @Get(`/`)
  @UseGuards(UserAuthGuard)
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

  /** Post one farrowing */
  @Post(`/create`)
  @UseGuards(UserAuthGuard)
  async createOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateFarrowingsDto,
  ) {
    const { user } = req;
    const { litter, note, date, codeFemale } = body;

    const findOneFemale = await this.animalsService.findOneBy({
      code: codeFemale,
      gender: 'FEMALE',
      status: 'ACTIVE',
      productionPhase: 'GESTATION',
    });
    if (!findOneFemale) {
      throw new HttpException(
        `Animal ${findOneFemale.code} doesn't exists, isn't in GESTATION phase  or isn't ACTIVE please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    const farrowing = await this.farrowingsService.createOne({
      date,
      note,
      litter,
      animalId: findOneFemale?.id,
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
    });

    return reply({
      res,
      results: {
        status: HttpStatus.CREATED,
        data: farrowing,
        message:
          'Farrowing created successfully please change productionPhase to LACTATION',
      },
    });
  }

  /** Update one farrowing */
  @Put(`/:farrowingId/edit`)
  @UseGuards(UserAuthGuard)
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateFarrowingsDto,
    @Param('farrowingId', ParseUUIDPipe) farrowingId: string,
  ) {
    const { user } = req;
    const { litter, note, date, codeFemale } = body;

    const findOneFarrowing = await this.farrowingsService.findOneBy({
      farrowingId,
    });
    if (!findOneFarrowing)
      throw new HttpException(
        `FarrowingId: ${farrowingId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneFemale = await this.animalsService.findOneBy({
      code: codeFemale,
      gender: 'FEMALE',
      status: 'ACTIVE',
      productionPhase: 'GESTATION',
    });
    if (!findOneFemale)
      throw new HttpException(
        `Animal ${findOneFemale.code} doesn't exists, isn't in GESTATION phase  or isn't ACTIVE please change`,
        HttpStatus.NOT_FOUND,
      );

    const farrowing = await this.farrowingsService.updateOne(
      { farrowingId: findOneFarrowing?.id },
      {
        note,
        date,
        litter,
        animalId: findOneFemale?.id,
        organizationId: user?.organizationId,
        userCreatedId: user?.id,
      },
    );

    return reply({
      res,
      results: {
        data: farrowing,
        message: 'Farrowing updated successfully',
      },
    });
  }

  /** Get one farrowing */
  @Get(`/view/:farrowingId`)
  @UseGuards(UserAuthGuard)
  async getOneByIdFarrowing(
    @Res() res,
    @Req() req,
    @Param('farrowingId', ParseUUIDPipe) farrowingId: string,
  ) {
    const { user } = req;
    const farrowing = await this.farrowingsService.findOneBy({
      farrowingId,
      organizationId: user?.organizationId,
    });
    if (!farrowingId)
      throw new HttpException(
        `FarrowingId: ${farrowingId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    return reply({ res, results: farrowing });
  }

  /** Delete one farrowing */
  @Delete(`/delete/:farrowingId`)
  @UseGuards(UserAuthGuard)
  async deleteOne(
    @Res() res,
    @Req() req,
    @Param('farrowingId', ParseUUIDPipe) farrowingId: string,
  ) {
    const { user } = req;
    const findOneFarrowing = await this.farrowingsService.findOneBy({
      farrowingId,
      organizationId: user?.organizationId,
    });
    if (!findOneFarrowing)
      throw new HttpException(
        `FarrowingId: ${farrowingId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    await this.farrowingsService.updateOne(
      { farrowingId: findOneFarrowing?.id },
      { deletedAt: new Date() },
    );

    return reply({ res, results: 'Farrowing deleted successfully' });
  }
}
