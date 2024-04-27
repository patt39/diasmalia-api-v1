import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseUUIDPipe,
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
import { AssignTypesService } from '../assigne-type/assigne-type.service';
import { CheckPregnanciesService } from '../check-pregnancies/check-pregnancies.service';
import { UserAuthGuard } from '../users/middleware';
import {
  CreateOrUpdateGestationsDto,
  GestationsQueryDto,
} from './gestations.dto';
import { GestationsService } from './gestations.service';

@Controller('gestations')
export class GestationsController {
  constructor(
    private readonly gestationsService: GestationsService,
    private readonly animalsService: AnimalsService,
    private readonly checkPregnanciesService: CheckPregnanciesService,
    private readonly assignTypesService: AssignTypesService,
  ) {}

  /** Get all gestations */
  @Get(`/`)
  @UseGuards(UserAuthGuard)
  async findAll(
    @Res() res,
    @Req() req,
    @Query() requestPaginationDto: RequestPaginationDto,
    @Query() query: SearchQueryDto,
    @Query() queryGestation: GestationsQueryDto,
  ) {
    const { user } = req;
    const { search } = query;
    const { animalTypeId } = queryGestation;

    const { take, page, sort } = requestPaginationDto;
    const pagination: PaginationType = addPagination({ page, take, sort });

    const gestations = await this.gestationsService.findAll({
      search,
      pagination,
      animalTypeId,
      organizationId: user?.organizationId,
    });

    return reply({ res, results: gestations });
  }

  /** Update one gestation */
  @Put(`/:gestationId`)
  @UseGuards(UserAuthGuard)
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateGestationsDto,
    @Param('gestationId', ParseUUIDPipe) gestationId: string,
  ) {
    const { user } = req;
    const { note, farrowingDate, codeFemale } = body;

    const findOneAssignType = await this.assignTypesService.findOneBy({
      status: true,
      organizationId: user?.organizationId,
    });
    if (!findOneAssignType)
      throw new HttpException(
        `AnimalType not assigned please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneGestation = await this.gestationsService.findOneBy({
      gestationId,
      organizationId: user.organization,
      animalTypeId: findOneAssignType.animalTypeId,
    });
    if (!findOneGestation) {
      throw new HttpException(
        `GestationId: ${gestationId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    const findOneFemale = await this.animalsService.findOneBy({
      code: codeFemale,
      gender: 'FEMALE',
      status: 'ACTIVE',
      productionPhase: 'GESTATION',
      animalTypeId: findOneAssignType.animalTypeId,
    });
    if (!findOneFemale)
      throw new HttpException(
        `Animal ${codeFemale} doesn't exists, isn't in GESTATION phase, isn't a FEMALE or isn't ACTIVE please change`,
        HttpStatus.NOT_FOUND,
      );

    const gestation = await this.gestationsService.updateOne(
      { gestationId: findOneGestation?.id },
      {
        note,
        farrowingDate,
        animalId: findOneFemale.id,
        userCreatedId: user.id,
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
  @Get(`/view/gestationId`)
  @UseGuards(UserAuthGuard)
  async getOneByIdGestation(
    @Res() res,
    @Req() req,
    @Param('gestationId', ParseUUIDPipe) gestationId: string,
  ) {
    const { user } = req;

    const findOneGestation = await this.gestationsService.findOneBy({
      gestationId,
      organizationId: user.organization,
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
  @UseGuards(UserAuthGuard)
  async deleteOne(
    @Res() res,
    @Req() req,
    @Param('gestationId', ParseUUIDPipe) gestationId: string,
  ) {
    const { user } = req;

    const findOneGestation = await this.gestationsService.findOneBy({
      gestationId,
      organizationId: user.organization,
    });
    if (!findOneGestation) {
      throw new HttpException(
        `GestationId: ${gestationId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    await this.gestationsService.updateOne(
      { gestationId: findOneGestation?.id },
      { deletedAt: new Date() },
    );

    return reply({ res, results: 'Gestation deleted successfully' });
  }
}
