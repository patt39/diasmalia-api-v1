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
import { UserAuthGuard } from '../users/middleware';
import {
  CreateOrUpdateBreedingsDto,
  GetAnimalBreedingsDto,
  GetAnimalBreedingsQueryDto,
} from './breedings.dto';
import { BreedingsService } from './breedings.service';

@Controller('breedings')
export class BreedingsController {
  constructor(
    private readonly breedingsService: BreedingsService,
    private readonly animalsService: AnimalsService,
    private readonly assignTypesService: AssignTypesService,
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
    const { method } = queryBreedings;

    const { take, page, sort } = requestPaginationDto;
    const pagination: PaginationType = addPagination({ page, take, sort });

    const breedings = await this.breedingsService.findAll({
      method,
      search,
      pagination,
      organizationId: user?.organizationId,
    });

    return reply({ res, results: breedings });
  }

  /** Get all breedings */
  @Get(`/animals`)
  @UseGuards(UserAuthGuard)
  async findAllAnimal(
    @Res() res,
    @Req() req,
    @Query() requestPaginationDto: RequestPaginationDto,
    @Query() query: SearchQueryDto,
    @Query() queryBreeding: GetAnimalBreedingsDto,
  ) {
    const { animalId } = queryBreeding;
    const { user } = req;
    const { search } = query;
    const { take, page, sort } = requestPaginationDto;
    const pagination: PaginationType = addPagination({ page, take, sort });

    const findOneAnimal = await this.animalsService.findOneBy({
      animalId,
      organizationId: user?.organizationId,
    });
    if (!findOneAnimal)
      throw new HttpException(
        `Animal ${animalId} doesn't exists, please change`,
        HttpStatus.NOT_FOUND,
      );

    const animals = await this.breedingsService.findAll({
      search,
      pagination,
      gender: findOneAnimal?.gender,
      animalId: findOneAnimal?.id,
      organizationId: user?.organizationId,
    });

    return reply({ res, results: animals });
  }

  /** Post one breeding */
  @Post(`/create`)
  @UseGuards(UserAuthGuard)
  async createOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateBreedingsDto,
  ) {
    const { user } = req;
    const { date, note, method, codeMale, codeFemale, animalTypeId } = body;

    const findOneAssignType = await this.assignTypesService.findOneBy({
      animalTypeId,
      organizationId: user.organizationId,
    });
    if (!findOneAssignType)
      throw new HttpException(
        `AnimalType not assigned please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneMale = await this.animalsService.findOneBy({
      code: codeMale,
      gender: 'MALE',
      status: 'ACTIVE',
      isCastrated: 'FALSE',
      isIsolated: 'FALSE',
      productionPhase: 'REPRODUCTION',
      animalTypeId: findOneAssignType.animalTypeId,
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
      isIsolated: 'FALSE',
      productionPhase: 'REPRODUCTION',
    });
    if (!findOneFemale)
      throw new HttpException(
        `Animal ${codeFemale} doesn't exists, isn't in REPRODUCTION phase, is Isolated or isn't ACTIVE please change`,
        HttpStatus.NOT_FOUND,
      );

    /** This is to check that animals are of same type */
    if (findOneMale.animalType.name !== findOneFemale.animalType.name)
      throw new HttpException(
        `Unable to perform breeding animals aren't of same type please change`,
        HttpStatus.NOT_FOUND,
      );

    /** This is to check for parenty in other to avoid inbreeding */
    if (
      findOneMale.code === findOneFemale.codeFather &&
      findOneMale.codeMother === findOneFemale.code
    ) {
      throw new HttpException(
        `Unable to perform breeding animals have same parents`,
        HttpStatus.BAD_REQUEST,
      );
    } else if (
      findOneMale.codeMother === findOneFemale.codeMother &&
      findOneMale.codeFather === findOneFemale.codeFather
    ) {
      throw new HttpException(
        `Unable to perform breeding animals are siblings`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const breeding = await this.breedingsService.createOne({
      date,
      note,
      method,
      animalMaleId: findOneMale.id,
      animalFemaleId: findOneFemale.id,
      animalTypeId: findOneAssignType.animalTypeId,
      organizationId: user.organizationId,
      userCreatedId: user.id,
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
    @Body() body: CreateOrUpdateBreedingsDto,
    @Param('breedingId', ParseUUIDPipe) breedingId: string,
  ) {
    const { user } = req;
    const { date, note, method, codeMale, codeFemale, animalTypeId } = body;

    const findOneAssignType = await this.assignTypesService.findOneBy({
      animalTypeId,
      organizationId: user.organizationId,
    });
    if (!findOneAssignType)
      throw new HttpException(
        `AnimalType not assigned please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneBreeding = await this.breedingsService.findOneBy({
      breedingId,
      checkStatus: false,
      organizationId: user.organizationId,
      animalTypeId: findOneAssignType.animalTypeId,
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
      isCastrated: 'FALSE',
      isIsolated: 'FALSE',
      productionPhase: 'REPRODUCTION',
      organizationId: user.organizationId,
    });
    if (!findOneMale)
      throw new HttpException(
        `Animal ${codeMale} doesn't exists, isn't in REPRODUCTION phase  or isn't ACTIVE please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneFemale = await this.animalsService.findOneBy({
      code: codeFemale,
      gender: 'FEMALE',
      status: 'ACTIVE',
      isCastrated: 'FALSE',
      isIsolated: 'FALSE',
      productionPhase: 'REPRODUCTION',
      organizationId: user.organizationId,
    });
    if (!findOneFemale)
      throw new HttpException(
        `Animal ${codeFemale} doesn't exists, isn't in REPRODUCTION phase  or isn't ACTIVE please change`,
        HttpStatus.NOT_FOUND,
      );

    /** This is to check that animals are of same type */
    if (findOneMale.animalType.name !== findOneFemale.animalType.name)
      throw new HttpException(
        `Unable to perform breeding animals aren't of same type please change`,
        HttpStatus.BAD_REQUEST,
      );

    /** This is to check for parenty in other to avoid inbreeding */
    if (
      findOneMale.code === findOneFemale.codeFather &&
      findOneMale.codeMother === findOneFemale.code
    ) {
      throw new HttpException(
        `Unable to perform breeding animals have same parents`,
        HttpStatus.BAD_REQUEST,
      );
    } else if (
      findOneMale.codeMother === findOneFemale.codeMother &&
      findOneMale.codeFather === findOneFemale.codeFather
    ) {
      throw new HttpException(
        `Unable to perform breeding animals are siblings`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const breeding = await this.breedingsService.updateOne(
      { breedingId: findOneBreeding.id },
      {
        date,
        note,
        method,
        animalMaleId: findOneMale.id,
        animalFemaleId: findOneFemale.id,
        userCreatedId: user.id,
      },
    );

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
  @Get(`/view/:breedingId`)
  @UseGuards(UserAuthGuard)
  async getOneByIdBreeding(
    @Res() res,
    @Req() req,
    @Param('breedingId', ParseUUIDPipe) breedingId: string,
  ) {
    const { user } = req;

    const findOneAssignType = await this.assignTypesService.findOneBy({
      status: true,
      organizationId: user.organizationId,
    });
    if (!findOneAssignType)
      throw new HttpException(
        `AnimalType not assigned please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOnebreeding = await this.breedingsService.findOneBreedingBy({
      breedingId,
      organizationId: user.organizationId,
    });
    if (!findOnebreeding) {
      throw new HttpException(
        `AnimalId: ${breedingId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    return reply({ res, results: findOnebreeding });
  }

  /** Delete one breeding */
  @Delete(`/delete/:breedingId`)
  @UseGuards(UserAuthGuard)
  async deleteOne(
    @Res() res,
    @Req() req,
    @Param('breedingId', ParseUUIDPipe) breedingId: string,
  ) {
    const { user } = req;

    const findOneBreeding = await this.breedingsService.findOneBy({
      breedingId,
      organizationId: user.organizationId,
    });
    if (!findOneBreeding) {
      throw new HttpException(
        `Breeding ${breedingId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    await this.breedingsService.updateOne(
      { breedingId: findOneBreeding.id },
      { deletedAt: new Date() },
    );

    return reply({ res, results: findOneBreeding });
  }
}
