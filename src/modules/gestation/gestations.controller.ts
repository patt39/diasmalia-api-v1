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

  /** Get all Gestations */
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

  /** Post one Gestation */
  @Post(`/`)
  @UseGuards(JwtAuthGuard)
  async createOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateGestationsDto,
  ) {
    const { user } = req;
    const { note, animalId, checkPregnancyId } = body;

    const findOneCheckPregnancy = await this.checkPregnanciesService.findOneBy({
      checkPregnancyId,
      result: 'PREGNANT',
      organizationId: user?.organization,
    });

    const findOneFemale = await this.animalsService.findOneBy({
      animalId,
      gender: 'FEMALE',
      status: 'ACTIVE',
      productionPhase: 'GESTATION',
      organizationId: user.organizationId,
    });
    if (!findOneFemale) {
      throw new HttpException(
        `Animal ${findOneFemale.code} doesn't exists, isn't in REPRODUCTION phase  or isn't ACTIVE please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    if (!findOneCheckPregnancy) {
      throw new HttpException(
        `Animal ${findOneFemale.code} is not PREGNANT please change it's production phase`,
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

  /** Update one Gestation */
  @Put(`/:gestationId`)
  @UseGuards(JwtAuthGuard)
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateGestationsDto,
    @Param('gestationId', ParseUUIDPipe) gestationId: string,
  ) {
    const { user } = req;
    const { note, animalId, checkPregnancyId } = body;
    const findOneCheckPregnancy = await this.checkPregnanciesService.findOneBy({
      checkPregnancyId,
      organizationId: user?.organization,
    });
    console.log('log =======>', findOneCheckPregnancy);

    if (!findOneCheckPregnancy) {
      throw new HttpException(
        `${checkPregnancyId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }
    const findOneFemale = await this.animalsService.findOneBy({
      animalId,
      gender: 'FEMALE',
      status: 'ACTIVE',
      productionPhase: 'GESTATION',
      organizationId: user.organizationId,
    });
    if (!findOneFemale) {
      throw new HttpException(
        `Animal ${findOneFemale.code} doesn't exists, isn't in REPRODUCTION phase  or isn't ACTIVE please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    const gestation = await this.gestationsService.updateOne(
      { gestationId },
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

  /** Get one Gestation */
  @Get(`/view`)
  @UseGuards(JwtAuthGuard)
  async getOneByIdUser(
    @Res() res,
    @Req() req,
    @Query('gestationId', ParseUUIDPipe) gestationId: string,
  ) {
    const { user } = req;
    const findOneCheckPregnancy = await this.gestationsService.findOneBy({
      gestationId,
      organizationId: user?.organization,
    });

    if (!findOneCheckPregnancy) {
      throw new HttpException(
        `${gestationId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }
    const gestation = await this.gestationsService.findOneBy({
      gestationId,
      organizationId: user?.organization,
    });

    return reply({ res, results: gestation });
  }

  /** Delete one Gestation */
  @Delete(`/delete/:gestationId`)
  @UseGuards(JwtAuthGuard)
  async deleteOne(
    @Res() res,
    @Req() req,
    @Param('gestationId', ParseUUIDPipe) gestationId: string,
  ) {
    const { user } = req;
    const findOneCheckPregnancy = await this.gestationsService.findOneBy({
      gestationId,
      organizationId: user?.organization,
    });

    if (!findOneCheckPregnancy) {
      throw new HttpException(
        `${gestationId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }
    const gestation = await this.gestationsService.updateOne(
      { gestationId },
      { deletedAt: new Date() },
    );

    return reply({ res, results: gestation });
  }
}
