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
import { AssignTypesService } from '../assigne-type/assigne-type.service';
import { BreedingsService } from '../breedings/breedings.service';
import { GestationsService } from '../gestation/gestations.service';
import { UserAuthGuard } from '../users/middleware';
import {
  checkPregancyQueryDto,
  CreateOrUpdateCheckPregnanciesDto,
} from './check-pregnancies.dto';
import { CheckPregnanciesService } from './check-pregnancies.service';

@Controller('check-pregnancies')
export class CheckPregnanciesController {
  constructor(
    private readonly animalsService: AnimalsService,
    private readonly breedingsService: BreedingsService,
    private readonly assignTypesService: AssignTypesService,
    private readonly gestationsService: GestationsService,
    private readonly checkPregnanciesService: CheckPregnanciesService,
  ) {}

  /** Get all checkPregnancies */
  @Get(`/`)
  @UseGuards(UserAuthGuard)
  async findAll(
    @Res() res,
    @Req() req,
    @Query() requestPaginationDto: RequestPaginationDto,
    @Query() query: SearchQueryDto,
    @Query() queryMethod: checkPregancyQueryDto,
  ) {
    const { user } = req;
    const { search } = query;
    const { method, result, animalTypeId } = queryMethod;

    const { take, page, sort } = requestPaginationDto;
    const pagination: PaginationType = addPagination({ page, take, sort });

    const CheckPregnancies = await this.checkPregnanciesService.findAll({
      method,
      result,
      search,
      pagination,
      animalTypeId,
      organizationId: user.organizationId,
    });

    return reply({ res, results: CheckPregnancies });
  }

  /** Post one checkPregnancy */
  @Post(`/create`)
  @UseGuards(UserAuthGuard)
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
      breedingId,
      farrowingDate,
      animalTypeId,
    } = body;

    const findOneBreeding = await this.breedingsService.findOneBy({
      breedingId,
      checkStatus: false,
      organizationId: user.organizationId,
    });

    const findOneAssignType = await this.assignTypesService.findOneBy({
      animalTypeId,
      organizationId: user.organizationId,
    });
    if (!findOneAssignType)
      throw new HttpException(
        `AnimalType not assigned please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOnecheckPregnancy = await this.checkPregnanciesService.findOneBy({
      breedingId,
      organizationId: user.organizationId,
      animalTypeId: findOneAssignType.animalTypeId,
    });
    if (!findOnecheckPregnancy) {
      await this.checkPregnanciesService.createOne({
        date,
        method,
        result,
        breedingId: findOneBreeding.id,
        animalFemaleId: findOneBreeding.animalFemaleId,
        animalTypeId: findOneAssignType.animalTypeId,
        organizationId: user.organizationId,
        userCreatedId: user.id,
      });
    } else {
      throw new HttpException(
        `Animal already checked please change`,
        HttpStatus.FOUND,
      );
    }

    await this.breedingsService.updateOne(
      { breedingId: findOneBreeding.id },
      { checkStatus: true },
    );

    const findOneGestation = await this.gestationsService.findOneBy({
      animalId: findOneBreeding.animalFemaleId,
      animalTypeId: findOneAssignType.animalTypeId,
    });

    if (result === 'PREGNANT' && !findOneGestation) {
      await this.gestationsService.createOne({
        note,
        farrowingDate,
        animalId: findOneBreeding.animalFemaleId,
        animalTypeId: findOneAssignType.animalTypeId,
        organizationId: user.organizationId,
        userCreatedId: user.id,
      });

      await this.animalsService.updateOne(
        { animalId: findOneBreeding.animalFemaleId },
        { productionPhase: 'GESTATION' },
      );
    }

    return reply({ res, results: 'CheckPregnancy Created Successfully' });
  }

  /** Update one checkPregnancy */
  @Put(`/:checkPregnancyId/edit`)
  @UseGuards(UserAuthGuard)
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateCheckPregnanciesDto,
    @Param('checkPregnancyId', ParseUUIDPipe) checkPregnancyId: string,
  ) {
    const { user } = req;
    const { date, method, result, breedingId } = body;

    const findOnecheckPregnancy = await this.checkPregnanciesService.findOneBy({
      checkPregnancyId,
      organizationId: user.organizationId,
    });
    if (!findOnecheckPregnancy)
      throw new HttpException(
        `CheckPregnancyId: ${checkPregnancyId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneBreeding = await this.breedingsService.findOneBy({
      breedingId,
      checkStatus: false,
      organizationId: user.organizationId,
    });
    if (!findOneBreeding)
      throw new HttpException(
        `Animal ${findOneBreeding.id} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const checkPregnancy = await this.checkPregnanciesService.updateOne(
      { checkPregnancyId: findOnecheckPregnancy.id },
      {
        date,
        method,
        result,
        breedingId: findOneBreeding.id,
        animalFemaleId: findOneBreeding.animalFemaleId,
        userCreatedId: user.id,
      },
    );

    if (result === 'OPEN' && findOneBreeding.animalFemaleId) {
      await this.gestationsService.updateOne(
        { gestationId: findOneBreeding.animalFemaleId },
        { deletedAt: new Date() },
      );
      await this.animalsService.updateOne(
        { animalId: findOneBreeding.animalFemaleId },
        { productionPhase: 'REPRODUCTION' },
      );
    }

    return reply({ res, results: checkPregnancy });
  }

  /** Get one checkPregnancy */
  @Get(`/view/checkPregnancyId`)
  @UseGuards(UserAuthGuard)
  async getOneByIdCheckPregnancy(
    @Res() res,
    @Req() req,
    @Param('checkPregnancyId', ParseUUIDPipe) checkPregnancyId: string,
  ) {
    const { user } = req;

    const findOnecheckPregnancy = await this.checkPregnanciesService.findOneBy({
      checkPregnancyId,
      organizationId: user.organizationId,
    });
    if (!findOnecheckPregnancy)
      throw new HttpException(
        `CheckPregnancyId: ${checkPregnancyId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    return reply({ res, results: findOnecheckPregnancy });
  }

  /** Delete one checkPregnancy */
  @Delete(`/delete/:checkPregnancyId`)
  @UseGuards(UserAuthGuard)
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
    if (!findOnecheckPregnancy)
      throw new HttpException(
        `CheckPregnancyId: ${checkPregnancyId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    await this.checkPregnanciesService.updateOne(
      { checkPregnancyId: findOnecheckPregnancy.id },
      { deletedAt: new Date() },
    );

    return reply({ res, results: 'CheckPregnancy deleted successfully' });
  }
}
