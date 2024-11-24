import {
  Body,
  Controller,
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
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { AnimalsService } from '../animals/animals.service';
import { BreedingsService } from '../breedings/breedings.service';
import { GestationsService } from '../gestation/gestations.service';
import { LocationsService } from '../locations/locations.service';
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
    private readonly locationsService: LocationsService,
    private readonly breedingsService: BreedingsService,
    private readonly gestationsService: GestationsService,
    private readonly activitylogsService: ActivityLogsService,
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
    const { animalTypeId } = queryMethod;

    const { take, page, sort, sortBy } = requestPaginationDto;
    const pagination: PaginationType = addPagination({
      page,
      take,
      sort,
      sortBy,
    });

    const CheckPregnancies = await this.checkPregnanciesService.findAll({
      search,
      pagination,
      animalTypeId,
      organizationId: user?.organizationId,
    });

    return reply({ res, results: CheckPregnancies });
  }

  /** Post one checkPregnancy */
  @Post(`/:breedingId/check`)
  @UseGuards(UserAuthGuard)
  async createOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateCheckPregnanciesDto,
    @Param('breedingId', ParseUUIDPipe) breedingId: string,
  ) {
    const { user } = req;
    const { result, method, farrowingDate } = body;

    const findOneBreeding = await this.breedingsService.findOneBy({
      breedingId,
      checkStatus: false,
      organizationId: user?.organizationId,
    });
    if (!findOneBreeding)
      throw new HttpException(
        `Breeding: ${breedingId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneFemale = await this.animalsService.findOneBy({
      animalId: findOneBreeding?.animalFemaleId,
      organizationId: user?.organizationId,
      animalTypeId: findOneBreeding?.animalTypeId,
    });
    if (!findOneFemale)
      throw new HttpException(
        `AnimalId doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const checkPregnancy = await this.checkPregnanciesService.createOne({
      result,
      animalId: findOneBreeding?.animalFemaleId,
      animalTypeId: findOneBreeding?.animalTypeId,
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
    });

    await this.activitylogsService.createOne({
      userId: user?.id,
      organizationId: user?.organizationId,
      message: `${user?.profile?.firstName} ${user?.profile?.lastName} checked a pregnancy for ${findOneBreeding?.femaleCode} in ${findOneBreeding?.animalTypeId}`,
    });

    await this.breedingsService.updateOne(
      { breedingId: findOneBreeding?.id },
      { checkStatus: true },
    );

    if (result === 'PREGNANT') {
      await this.gestationsService.createOne({
        method: method,
        breedingId: findOneBreeding?.id,
        checkPregnancyId: checkPregnancy?.id,
        farrowingDate: new Date(farrowingDate),
        animalId: findOneBreeding?.animalFemaleId,
        animalTypeId: findOneBreeding?.animalTypeId,
        organizationId: user?.organizationId,
        userCreatedId: user?.id,
      });

      await this.animalsService.updateOne(
        { animalId: findOneBreeding?.animalFemaleId },
        { productionPhase: 'GESTATION' },
      );

      await this.breedingsService.updateOne(
        { breedingId: findOneBreeding?.id },
        { result: result },
      );
    }

    if (result === 'OPEN') {
      await this.breedingsService.updateOne(
        { breedingId: findOneBreeding?.id },
        { result: result },
      );
    }

    await this.activitylogsService.createOne({
      userId: user?.id,
      organizationId: user?.organizationId,
      message: `${user?.profile?.firstName} ${user?.profile?.lastName} created a gestation for ${findOneBreeding?.femaleCode}`,
    });

    return reply({ res, results: 'Breeding checked Successfully' });
  }

  /** Update one checkPregnancy */
  @Put(`/:checkPregnancyId/recheck`)
  @UseGuards(UserAuthGuard)
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateCheckPregnanciesDto,
    @Param('checkPregnancyId', ParseUUIDPipe) checkPregnancyId: string,
  ) {
    const { user } = req;
    const { result, method } = body;

    const findOnecheckPregnancy = await this.checkPregnanciesService.findOneBy({
      checkPregnancyId,
      organizationId: user?.organizationId,
    });
    if (!findOnecheckPregnancy)
      throw new HttpException(
        `CheckPregnancyId: ${checkPregnancyId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneGestation = await this.gestationsService.findOneBy({
      checkPregnancyId,
      organizationId: user?.organizationId,
    });
    if (!findOneGestation)
      throw new HttpException(
        `CheckPregnancyId: ${checkPregnancyId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    if (result === 'OPEN' && findOneGestation) {
      await this.gestationsService.updateOne(
        { gestationId: findOneGestation?.id },
        { deletedAt: new Date() },
      );
      await this.animalsService.updateOne(
        { animalId: findOneGestation?.animalId },
        { productionPhase: 'REPRODUCTION' },
      );
      await this.breedingsService.updateOne(
        { breedingId: findOneGestation?.breedingId },
        { result: result },
      );
    }

    if (result === 'PREGNANT' && findOneGestation) {
      await this.gestationsService.updateOne(
        { gestationId: findOneGestation?.id },
        { method: method },
      );
    }

    await this.checkPregnanciesService.updateOne(
      { checkPregnancyId: findOnecheckPregnancy?.id },
      { result },
    );

    await this.activitylogsService.createOne({
      userId: user.id,
      organizationId: user.organizationId,
      message: `${user.profile?.firstName} ${user.profile?.lastName} rechecked breeding for ${findOneGestation?.animal?.code}`,
    });

    return reply({ res, results: 'CheckPregnancy updated successfully' });
  }
}
