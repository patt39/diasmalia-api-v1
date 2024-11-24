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
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { AnimalsService } from '../animals/animals.service';
import { UserAuthGuard } from '../users/middleware';
import {
  CreateBreedingsDto,
  GetAnimalBreedingsDto,
  GetAnimalBreedingsQueryDto,
  UpdateBreedingsDto,
} from './breedings.dto';
import { BreedingsService } from './breedings.service';

@Controller('breedings')
export class BreedingsController {
  constructor(
    private readonly breedingsService: BreedingsService,
    private readonly animalsService: AnimalsService,
    private readonly activitylogsService: ActivityLogsService,
  ) {}

  /** Get all breedings */
  @Get(`/`)
  @UseGuards(UserAuthGuard)
  async findAll(
    @Res() res,
    @Req() req,
    @Query() requestPaginationDto: RequestPaginationDto,
    @Query() query: SearchQueryDto,
    @Query() queryBreedings: GetAnimalBreedingsQueryDto,
  ) {
    const { user } = req;
    const { search } = query;
    const { method, animalTypeId, periode } = queryBreedings;

    const { take, page, sort, sortBy } = requestPaginationDto;
    const pagination: PaginationType = addPagination({
      page,
      take,
      sort,
      sortBy,
    });

    const breedings = await this.breedingsService.findAll({
      method,
      search,
      pagination,
      animalTypeId,
      periode: Number(periode),
      organizationId: user?.organizationId,
    });

    return reply({ res, results: breedings });
  }

  /** Get  breeding history */
  @Get(`/animal/history`)
  @UseGuards(UserAuthGuard)
  async getBreedingHistory(
    @Res() res,
    @Req() req,
    @Query() requestPaginationDto: RequestPaginationDto,
    @Query() query: SearchQueryDto,
    @Query() queryBreeding: GetAnimalBreedingsDto,
  ) {
    const { animalId } = queryBreeding;
    const { user } = req;
    const { search } = query;
    const { take, page, sort, sortBy } = requestPaginationDto;
    const pagination: PaginationType = addPagination({
      page,
      take,
      sort,
      sortBy,
    });

    const findOneAnimal = await this.animalsService.findOneBy({
      animalId,
      organizationId: user?.organizationId,
    });
    if (!findOneAnimal)
      throw new HttpException(
        `Animal ${animalId} doesn't exists, please change`,
        HttpStatus.NOT_FOUND,
      );

    const animals = await this.breedingsService.findBreedingHistory({
      search,
      pagination,
      gender: findOneAnimal?.gender,
      animalId: findOneAnimal?.id,
      animalTypeId: findOneAnimal?.animalTypeId,
      organizationId: user?.organizationId,
    });

    return reply({ res, results: animals });
  }

  /** Post one breeding */
  @Post(`/create`)
  @UseGuards(UserAuthGuard)
  async createOne(@Res() res, @Req() req, @Body() body: CreateBreedingsDto) {
    const { user } = req;
    const { note, method, codeMale, codeFemale } = body;

    const findOneMale = await this.animalsService.findOneBy({
      code: codeMale,
      gender: 'MALE',
      status: 'ACTIVE',
      isCastrated: 'NO',
      isIsolated: 'NO',
      productionPhase: 'REPRODUCTION',
    });
    if (!findOneMale)
      throw new HttpException(
        `Animal ${codeMale} doesn't exists, isn't in REPRODUCTION phase, isCastrated or isn't ACTIVE please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneFemale = await this.animalsService.findOneBy({
      code: codeFemale,
      gender: 'FEMALE',
      status: 'ACTIVE',
      isIsolated: 'NO',
      productionPhase: 'REPRODUCTION',
    });
    if (!findOneFemale)
      throw new HttpException(
        `Animal ${codeFemale} doesn't exists, isn't in REPRODUCTION phase, is Isolated or isn't ACTIVE please change`,
        HttpStatus.NOT_FOUND,
      );

    /** This is to check that animals are of same type */
    if (findOneMale?.animalType?.name !== findOneFemale?.animalType?.name)
      throw new HttpException(
        `Unable to perform breeding animals aren't of same type please change`,
        HttpStatus.NOT_FOUND,
      );

    /** This is to check for parenty in other to avoid inbreeding */
    if (
      findOneMale?.code === findOneFemale?.codeFather &&
      findOneMale?.codeMother === findOneFemale?.code
    ) {
      throw new HttpException(
        `Unable to perform breeding animals have same parents`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const breeding = await this.breedingsService.createOne({
      note,
      method,
      maleCode: findOneMale?.code,
      animalMaleId: findOneMale?.id,
      femaleCode: findOneFemale?.code,
      animalFemaleId: findOneFemale?.id,
      animalTypeId: findOneMale?.animalTypeId,
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
    });

    await this.activitylogsService.createOne({
      userId: user?.id,
      organizationId: user?.organizationId,
      message: `${user?.profile?.firstName} ${user?.profile?.lastName} breeded ${findOneMale?.code} with ${findOneFemale?.code} in ${findOneMale?.animalType?.name}`,
    });

    return reply({
      res,
      results: {
        status: HttpStatus.CREATED,
        data: breeding,
        message: `Breeding created please don't forget to checkPregnancy`,
      },
    });
  }

  /** Update one breeding */
  @Put(`/:breedingId/edit`)
  @UseGuards(UserAuthGuard)
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: UpdateBreedingsDto,
    @Param('breedingId', ParseUUIDPipe) breedingId: string,
  ) {
    const { user } = req;
    const { note, method, codeMale, codeFemale } = body;

    const findOneBreeding = await this.breedingsService.findOneBy({
      breedingId,
      organizationId: user.organizationId,
    });
    if (!findOneBreeding)
      throw new HttpException(
        `BreedingId: ${breedingId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneMale = await this.animalsService.findOneBy({
      code: codeMale,
      gender: 'MALE',
      status: 'ACTIVE',
      isCastrated: 'NO',
      isIsolated: 'NO',
      productionPhase: 'REPRODUCTION',
    });
    if (!findOneMale)
      throw new HttpException(
        `Animal ${codeMale} doesn't exists, isn't in REPRODUCTION phase, isCastrated or isn't ACTIVE please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneFemale = await this.animalsService.findOneBy({
      code: codeFemale,
      gender: 'FEMALE',
      status: 'ACTIVE',
      isIsolated: 'NO',
      productionPhase: 'REPRODUCTION',
    });
    if (!findOneFemale)
      throw new HttpException(
        `Animal ${codeFemale} doesn't exists, isn't in REPRODUCTION phase, is Isolated or isn't ACTIVE please change`,
        HttpStatus.NOT_FOUND,
      );

    /** This is to check for parenty in other to avoid inbreeding */
    if (
      findOneMale?.code === findOneFemale?.codeFather &&
      findOneMale?.codeMother === findOneFemale?.code
    ) {
      throw new HttpException(
        `Unable to perform breeding animals have same parents`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const breeding = await this.breedingsService.updateOne(
      { breedingId: findOneBreeding?.id },
      {
        note,
        method,
        maleCode: findOneMale?.code,
        animalMaleId: findOneMale?.id,
        femaleCode: findOneFemale?.code,
        animalFemaleId: findOneFemale?.id,
      },
    );

    await this.activitylogsService.createOne({
      userId: user?.id,
      organizationId: user?.organizationId,
      message: `${user?.profile?.firstName} ${user?.profile?.lastName} updated the breeding between ${findOneBreeding?.maleCode} and ${findOneBreeding?.femaleCode} in ${findOneMale?.animalType?.name}`,
    });

    return reply({
      res,
      results: {
        status: HttpStatus.CREATED,
        data: breeding,
        message: `Breeding updated successfully`,
      },
    });
  }

  /** Get one breeding */
  @Get(`/:breedingId/view`)
  @UseGuards(UserAuthGuard)
  async getOneByIdBreeding(
    @Res() res,
    @Req() req,
    @Param('breedingId', ParseUUIDPipe) breedingId: string,
  ) {
    const { user } = req;

    const findOnebreeding = await this.breedingsService.findOneBy({
      breedingId,
      organizationId: user?.organizationId,
    });
    if (!findOnebreeding) {
      throw new HttpException(
        `AnimalId: ${breedingId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    return reply({ res, results: findOnebreeding });
  }

  /** Get one breeding by male animalId */
  @Get(`/:animalMaleId/view/breeding`)
  @UseGuards(UserAuthGuard)
  async getOneByMaleId(
    @Res() res,
    @Req() req,
    @Param('animalMaleId', ParseUUIDPipe) animalMaleId: string,
  ) {
    const { user } = req;

    const findOnebreeding = await this.breedingsService.findOneBy({
      animalMaleId,
      organizationId: user?.organizationId,
    });
    if (!findOnebreeding) {
      throw new HttpException(
        `${animalMaleId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    return reply({ res, results: findOnebreeding });
  }

  /** Get one breeding by femaleId */
  @Get(`/:animalFemaleId/view/female-breeding`)
  @UseGuards(UserAuthGuard)
  async getOneByFemaleId(
    @Res() res,
    @Req() req,
    @Param('animalFemaleId', ParseUUIDPipe) animalFemaleId: string,
  ) {
    const { user } = req;

    const findOnebreeding = await this.breedingsService.findOneBy({
      animalFemaleId,
      organizationId: user?.organizationId,
    });
    if (!findOnebreeding) {
      throw new HttpException(
        `${animalFemaleId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    return reply({ res, results: findOnebreeding });
  }

  /** Delete one breeding */
  @Delete(`/:breedingId/delete`)
  @UseGuards(UserAuthGuard)
  async deleteOne(
    @Res() res,
    @Req() req,
    @Param('breedingId', ParseUUIDPipe) breedingId: string,
  ) {
    const { user } = req;

    const findOneBreeding = await this.breedingsService.findOneBy({
      breedingId,
      organizationId: user?.organizationId,
    });
    if (!findOneBreeding)
      throw new HttpException(
        `Breeding ${breedingId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    await this.breedingsService.updateOne(
      { breedingId: findOneBreeding?.id },
      { deletedAt: new Date() },
    );

    await this.activitylogsService.createOne({
      userId: user?.id,
      organizationId: user?.organizationId,
      message: `${user?.profile?.firstName} ${user?.profile?.lastName} deleted a breeding`,
    });

    return reply({ res, results: findOneBreeding });
  }
}
