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
import { CreateOrUpdateBreedingsDto } from './breedings.dto';
import { BreedingsService } from './breedings.service';

@Controller('breedings')
export class BreedingsController {
  constructor(
    private readonly breedingsService: BreedingsService,
    private readonly animalsService: AnimalsService,
  ) {}

  /** Get all Breedings */
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

    const breedings = await this.breedingsService.findAll({
      search,
      pagination,
      organizationId: user?.organizationId,
    });

    return reply({ res, results: breedings });
  }

  /** Post one Breeding */
  @Post(`/`)
  @UseGuards(JwtAuthGuard)
  async createOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateBreedingsDto,
  ) {
    const { user } = req;
    const { date, note, method, codeMale, codeFemale } = body;

    const findOneMale = await this.animalsService.findOneBy({
      code: codeMale,
      gender: 'MALE',
      status: 'ACTIVE',
      productionPhase: 'REPRODUCTION',
      organizationId: user.organizationId,
    });
    if (!findOneMale) {
      throw new HttpException(
        `Animal ${codeMale} doesn't exists, isn't in REPRODUCTION phase  or isn't ACTIVE please change`,
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
    //console.log('log====>', findOneFemale);
    if (!findOneFemale) {
      throw new HttpException(
        `Animal ${codeFemale} doesn't exists, isn't in REPRODUCTION phase  or isn't ACTIVE please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    /** This is to check that animals are of same type */
    if (findOneMale?.type !== findOneFemale?.type) {
      throw new HttpException(
        `Unable to perform breeding animals aren't of same type please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    /** This is to check that animals don't have same parents */
    if (
      findOneMale.codeMother == findOneFemale.codeMother &&
      findOneMale.codeFather == findOneFemale.codeFather
    ) {
      throw new HttpException(
        `Unable to perform breeding animals have same parents`,
        HttpStatus.NOT_FOUND,
      );
    }

    /** This is to check that animals don't have same ancestors */
    if (
      findOneMale.code == findOneFemale.codeFather &&
      findOneMale.code == findOneFemale.codeMother &&
      findOneMale.codeFather == findOneFemale.code &&
      findOneMale.codeMother == findOneFemale.code
    ) {
      throw new HttpException(
        `Unable to perform breeding animals have same ancestors`,
        HttpStatus.NOT_FOUND,
      );
    }

    /** This is to check that animals are of same productionPhase 
    if (findOneMale.productionPhase !== 'REPRODUCTION') {
      throw new HttpException(
        `Unable to perform breeding animal isn't in REPRODUCION phase`,
        HttpStatus.NOT_FOUND,
      );
    } */

    const breeding = await this.breedingsService.createOne({
      date,
      note,
      method,
      animalMaleId: findOneMale?.id,
      animalFemaleId: findOneFemale?.id,
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
    });

    return reply({ res, results: breeding });
  }

  /** Update one Breeding */
  @Put(`/:breedingId`)
  @UseGuards(JwtAuthGuard)
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateBreedingsDto,
    @Param('breedingId', ParseUUIDPipe) breedingId: string,
  ) {
    const { user } = req;
    const { date, note, method, codeMale, codeFemale } = body;
    const findOneBreeding = await this.breedingsService.findOneBy({
      breedingId,
      organizationId: user.organizationId,
    });
    if (!findOneBreeding) {
      throw new HttpException(
        `${breedingId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    const findOneMale = await this.animalsService.findOneBy({
      code: codeMale,
      gender: 'MALE',
      status: 'ACTIVE',
      organizationId: user.organizationId,
    });
    if (!findOneMale) {
      throw new HttpException(
        `Animal ${codeMale} doesn't exists or is not ACTIVE please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    const findOneFemale = await this.animalsService.findOneBy({
      code: codeFemale,
      gender: 'FEMALE',
      status: 'ACTIVE',
      organizationId: user.organizationId,
    });
    if (!findOneFemale) {
      throw new HttpException(
        `Animal ${codeFemale} doesn't exists or is not ACTIVE please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    const breeding = await this.breedingsService.updateOne(
      { breedingId: findOneBreeding?.id },
      {
        date,
        note,
        method,
        animalMaleId: findOneMale?.id,
        animalFemaleId: findOneFemale?.id,
        organizationId: user?.organizationId,
        userCreatedId: user?.id,
      },
    );

    return reply({ res, results: breeding });
  }

  /** Get one Breedings */
  @Get(`/view`)
  @UseGuards(JwtAuthGuard)
  async getOneByIdUser(
    @Res() res,
    @Query('breedingId', ParseUUIDPipe) breedingId: string,
  ) {
    const breeding = await this.breedingsService.findOneBy({
      breedingId,
    });

    if (!breeding) {
      throw new HttpException(
        `${breedingId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    return reply({ res, results: breeding });
  }

  /** Delete one Breedings */
  @Delete(`/delete/:breedingId`)
  @UseGuards(JwtAuthGuard)
  async deleteOne(
    @Res() res,
    @Param('breedingId', ParseUUIDPipe) breedingId: string,
  ) {
    const breeding = await this.breedingsService.updateOne(
      { breedingId },
      { deletedAt: new Date() },
    );
    if (!breeding) {
      throw new HttpException(
        `${breedingId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    return reply({ res, results: breeding });
  }
}
