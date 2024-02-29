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
import { BreedingsService } from '../breedings/breedings.service';
import { JwtAuthGuard } from '../users/middleware';
import {
  checkPregancyMethodDto,
  checkPregancyResultDto,
  CreateOrUpdateCheckPregnanciesDto,
} from './check-pregnancies.dto';
import { CheckPregnanciesService } from './check-pregnancies.service';

@Controller('check-pregnancies')
export class CheckPregnanciesController {
  constructor(
    private readonly checkPregnanciesService: CheckPregnanciesService,
    private readonly animalsService: AnimalsService,
    private readonly breedingsService: BreedingsService,
  ) {}

  /** Get all checkPregnancies */
  @Get(`/`)
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Res() res,
    @Req() req,
    @Query() requestPaginationDto: RequestPaginationDto,
    @Query() query: SearchQueryDto,
    @Query() queryMethod: checkPregancyMethodDto,
    @Query() queryResult: checkPregancyResultDto,
  ) {
    const { user } = req;
    const { search } = query;
    const { method } = queryMethod;
    const { result } = queryResult;

    const { take, page, sort } = requestPaginationDto;
    const pagination: PaginationType = addPagination({ page, take, sort });

    const CheckPregnancies = await this.checkPregnanciesService.findAll({
      method,
      result,
      search,
      pagination,
      organizationId: user?.organizationId,
    });

    return reply({ res, results: CheckPregnancies });
  }

  /** Post one checkPregnancy */
  @Post(`/`)
  @UseGuards(JwtAuthGuard)
  async createOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateCheckPregnanciesDto,
  ) {
    const { user } = req;
    const {
      date,
      note,
      result,
      method,
      codeFemale,
      breedingId,
      farrowingDate,
    } = body;

    const findOneBreeding = await this.breedingsService.findOneBy({
      breedingId,
      checkStatus: false,
      organizationId: user.organizationId,
    });

    const findOneFemale = await this.animalsService.findOneBy({
      code: codeFemale,
      gender: 'FEMALE',
      status: 'ACTIVE',
      productionPhase: 'REPRODUCTION',
      organizationId: user.organizationId,
    });
    if (!findOneFemale) {
      throw new HttpException(
        `Animal ${codeFemale} doesn't exists, isn't in REPRODUCTION phase  or isn't ACTIVE please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    const checkPregnancy = await this.checkPregnanciesService.createOne({
      date,
      note,
      method,
      result,
      farrowingDate,
      breedingId: findOneBreeding?.id,
      animalFemaleId: findOneFemale?.id,
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
    });

    await this.breedingsService.updateOne(
      { breedingId: findOneBreeding?.id },
      {
        checkStatus: !findOneBreeding?.checkStatus,
      },
    );

    return reply({ res, results: checkPregnancy });
  }

  /** Update one checkPregnancy */
  @Put(`/:checkPregnancyId`)
  @UseGuards(JwtAuthGuard)
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateCheckPregnanciesDto,
    @Param('checkPregnancyId', ParseUUIDPipe) checkPregnancyId: string,
  ) {
    const { user } = req;
    const { date, note, method, result, codeFemale, farrowingDate } = body;

    const findOnecheckPregnancy = await this.checkPregnanciesService.findOneBy({
      checkPregnancyId,
    });
    if (!findOnecheckPregnancy) {
      throw new HttpException(
        `CheckPregnancyId: ${checkPregnancyId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    const findOneBreeding = await this.breedingsService.findOneBy({
      checkStatus: false,
      organizationId: user.organizationId,
    });
    if (!findOneBreeding) {
      throw new HttpException(
        `Animal ${findOneBreeding.id} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    const findOneFemale = await this.animalsService.findOneBy({
      code: codeFemale,
      gender: 'FEMALE',
      status: 'ACTIVE',
      productionPhase: 'REPRODUCTION',
      organizationId: user?.organizationId,
    });
    if (!findOneFemale) {
      throw new HttpException(
        `Animal ${codeFemale} doesn't exists, isn't in REPRODUCTION phase  or isn't ACTIVE please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    const checkPregnancy = await this.checkPregnanciesService.updateOne(
      { checkPregnancyId: findOnecheckPregnancy?.id },
      {
        date,
        note,
        method,
        result,
        farrowingDate,
        breedingId: findOneBreeding?.id,
        animalFemaleId: findOneFemale?.id,
        organizationId: user?.organizationId,
        userCreatedId: user?.id,
      },
    );

    return reply({ res, results: checkPregnancy });
  }

  /** Get one checkPregnancy */
  @Get(`/view`)
  @UseGuards(JwtAuthGuard)
  async getOneByIdCheckPregnancy(
    @Res() res,
    @Req() req,
    @Query('checkPregnancyId', ParseUUIDPipe) checkPregnancyId: string,
  ) {
    const { user } = req;

    const findOnecheckPregnancy = await this.checkPregnanciesService.findOneBy({
      checkPregnancyId,
      organizationId: user?.organizationId,
    });
    if (!checkPregnancyId) {
      throw new HttpException(
        `CheckpregnancyId: ${checkPregnancyId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    return reply({ res, results: findOnecheckPregnancy });
  }

  /** Delete one checkPregnancy */
  @Delete(`/delete/:checkPregnancyId`)
  @UseGuards(JwtAuthGuard)
  async deleteOne(
    @Res() res,
    @Req() req,
    @Param('checkPregnancyId', ParseUUIDPipe) checkPregnancyId: string,
  ) {
    const { user } = req;

    const findOnecheckPregnancy = await this.checkPregnanciesService.findOneBy({
      checkPregnancyId,
      organizationId: user?.organizationId,
    });
    if (!checkPregnancyId) {
      throw new HttpException(
        `checkPregnancyId: ${checkPregnancyId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    await this.checkPregnanciesService.updateOne(
      { checkPregnancyId },
      { deletedAt: new Date() },
    );

    return reply({ res, results: findOnecheckPregnancy });
  }
}
