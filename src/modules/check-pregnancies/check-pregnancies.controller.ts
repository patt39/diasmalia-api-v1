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
import { CreateOrUpdateCheckPregnanciesDto } from './check-pregnancies.dto';
import { CheckPregnanciesService } from './check-pregnancies.service';

@Controller('check-pregnancies')
export class CheckPregnanciesController {
  constructor(
    private readonly checkPregnanciesService: CheckPregnanciesService,
    private readonly animalsService: AnimalsService,
    private readonly breedingsService: BreedingsService,
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

  /** Post one CheckPregnancy */
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
      farrowingDate,
      method,
      result,
      codeFemale,
      breedingId,
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

    if (findOneBreeding.checkStatus == true) {
      throw new HttpException(
        `Animal ${codeFemale} can't be checked already done please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    const checkPregnancy = await this.checkPregnanciesService.createOne({
      date,
      note,
      farrowingDate,
      method,
      result,
      breedingId: findOneBreeding?.id,
      animalFemaleId: findOneFemale?.id,
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
    });

    return reply({ res, results: checkPregnancy });
  }

  /** Update one CheckPregnancy */
  @Put(`/:checkPregnancyId`)
  @UseGuards(JwtAuthGuard)
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateCheckPregnanciesDto,
    @Param('checkPregnancyId', ParseUUIDPipe) checkPregnancyId: string,
  ) {
    const { user } = req;
    const {
      date,
      note,
      farrowingDate,
      method,
      result,
      codeFemale,
      breedingId,
    } = body;

    const findOnecheckPregnancy = await this.checkPregnanciesService.findOneBy({
      checkPregnancyId,
      organizationId: user.organizationId,
    });

    if (!findOnecheckPregnancy) {
      throw new HttpException(
        `${checkPregnancyId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    const findOneBreeding = await this.breedingsService.findOneBy({
      breedingId,
      checkStatus: false,
      organizationId: user.organizationId,
    });
    if (!findOneBreeding) {
      throw new HttpException(
        `Animal ${breedingId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }

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

    const checkPregnancy = await this.checkPregnanciesService.updateOne(
      { checkPregnancyId },
      {
        date,
        note,
        farrowingDate,
        method,
        result,
        breedingId: findOneBreeding.id,
        animalFemaleId: findOneFemale?.id,
        organizationId: user?.organizationId,
        userCreatedId: user?.id,
      },
    );

    return reply({ res, results: checkPregnancy });
  }

  /** Get one CheckPregnancy */
  @Get(`/view`)
  @UseGuards(JwtAuthGuard)
  async getOneByIdUser(
    @Res() res,
    @Req() req,
    @Query('checkPregnancyId', ParseUUIDPipe) checkPregnancyId: string,
  ) {
    const { user } = req;
    const findOnecheckPregnancy = await this.checkPregnanciesService.findOneBy({
      checkPregnancyId,
      organizationId: user.organizationId,
    });

    if (!checkPregnancyId) {
      throw new HttpException(
        `${checkPregnancyId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    return reply({ res, results: findOnecheckPregnancy });
  }

  /** Delete one CheckPregnancy */
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
      organizationId: user.organizationId,
    });

    if (!checkPregnancyId) {
      throw new HttpException(
        `${checkPregnancyId} doesn't exists please change`,
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
