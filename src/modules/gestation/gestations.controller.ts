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
import { RequestPaginationDto } from '../../app/utils/pagination/request-pagination.dto';
import {
  PaginationType,
  addPagination,
} from '../../app/utils/pagination/with-pagination';
import { reply } from '../../app/utils/reply';
import { SearchQueryDto } from '../../app/utils/search-query/search-query.dto';
import { AnimalsService } from '../animals/animals.service';
import { CheckPregnanciesService } from '../check-pregnancies/check-pregnancies.service';
import { JwtAuthGuard } from '../users/middleware';
import { CreateOrUpdateGestationsDto } from './gestations.dto';
import { GestationsService } from './gestations.service';

@Controller('gestations')
export class GestationsController {
  constructor(
    private readonly gestationsService: GestationsService,
    private readonly animalsService: AnimalsService,
    private readonly checkPregnanciesService: CheckPregnanciesService,
  ) {}

  /** Get all gestations */
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

    const gestations = await this.gestationsService.findAll({
      search,
      pagination,
      organizationId: user?.organizationId,
    });

    return reply({ res, results: gestations });
  }

  /** Post one gestation */
  @Post(`/`)
  @UseGuards(JwtAuthGuard)
  async createOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateGestationsDto,
  ) {
    const { user } = req;
    const { note, codeFemale } = body;

    const findOneCheckPregnancy = await this.checkPregnanciesService.findOneBy({
      result: 'PREGNANT',
      organizationId: user?.organization,
    });
    if (!findOneCheckPregnancy) {
      throw new HttpException(
        `Animal ${codeFemale} is not PREGNANT please change it's production phase`,
        HttpStatus.NOT_FOUND,
      );
    }

    const findOneFemale = await this.animalsService.findOneBy({
      code: codeFemale,
      gender: 'FEMALE',
      status: 'ACTIVE',
      productionPhase: 'GESTATION',
      organizationId: user.organizationId,
    });
    if (!findOneFemale) {
      throw new HttpException(
        `Animal ${codeFemale} doesn't exists, isn't in GESTATION phase, isn't a FEMALE or isn't ACTIVE please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    const gestation = await this.gestationsService.createOne({
      note,
      animalId: findOneFemale.id,
      checkPregnancyId: findOneCheckPregnancy.id,
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
    });

    return reply({
      res,
      results: {
        status: HttpStatus.CREATED,
        data: gestation,
        message: 'Gestation created successfully',
      },
    });
  }

  /** Update one gestation */
  @Put(`/:gestationId`)
  @UseGuards(JwtAuthGuard)
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateGestationsDto,
    @Param('gestationId', ParseUUIDPipe) gestationId: string,
  ) {
    const { user } = req;
    const { note, codeFemale, checkPregnancyId } = body;

    const findOneGestation = await this.gestationsService.findOneBy({
      gestationId,
    });
    if (!findOneGestation) {
      throw new HttpException(
        `${gestationId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    const findOneCheckPregnancy = await this.checkPregnanciesService.findOneBy({
      checkPregnancyId,
      organizationId: user?.organization,
    });
    if (!findOneCheckPregnancy) {
      throw new HttpException(
        `${checkPregnancyId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    const findOneFemale = await this.animalsService.findOneBy({
      code: codeFemale,
      gender: 'FEMALE',
      status: 'ACTIVE',
      productionPhase: 'GESTATION',
      organizationId: user.organizationId,
    });
    if (!findOneFemale) {
      throw new HttpException(
        `Animal ${codeFemale} doesn't exists, isn't in GESTATION phase, isn't a FEMALE or isn't ACTIVE please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    const gestation = await this.gestationsService.updateOne(
      { gestationId: findOneGestation?.id },
      {
        note,
        animalId: findOneFemale.id,
        checkPregnancyId: findOneCheckPregnancy.id,
        organizationId: user?.organizationId,
        userCreatedId: user?.id,
      },
    );

    return reply({
      res,
      results: {
        status: HttpStatus.CREATED,
        data: gestation,
        message: 'Gestation updated successfully',
      },
    });
  }

  /** Get one gestation */
  @Get(`/view`)
  @UseGuards(JwtAuthGuard)
  async getOneByIdGestation(
    @Res() res,
    @Req() req,
    @Query('gestationId', ParseUUIDPipe) gestationId: string,
  ) {
    const { user } = req;
    const findOneGestation = await this.gestationsService.findOneBy({
      gestationId,
      organizationId: user?.organization,
    });
    if (!findOneGestation) {
      throw new HttpException(
        `GestationId: ${gestationId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    return reply({ res, results: findOneGestation });
  }

  /** Delete one gestation */
  @Delete(`/delete/:gestationId`)
  @UseGuards(JwtAuthGuard)
  async deleteOne(
    @Res() res,
    @Req() req,
    @Param('gestationId', ParseUUIDPipe) gestationId: string,
  ) {
    const { user } = req;

    const findOneGestation = await this.gestationsService.findOneBy({
      gestationId,
      organizationId: user?.organization,
    });
    if (!findOneGestation) {
      throw new HttpException(
        `GestationId: ${gestationId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    const gestation = await this.gestationsService.updateOne(
      { gestationId: findOneGestation?.id },
      { deletedAt: new Date() },
    );

    return reply({ res, results: gestation });
  }
}
