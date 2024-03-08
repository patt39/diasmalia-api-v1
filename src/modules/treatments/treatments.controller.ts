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
import { UserAuthGuard } from '../users/middleware';
import { CreateOrUpdateTreatmentsDto } from './treatments.dto';
import { TreatmentsService } from './treatments.service';

@Controller('treatments')
export class TreatmentsController {
  constructor(
    private readonly treatmentsService: TreatmentsService,
    private readonly animalsService: AnimalsService,
  ) {}

  /** Get all Treatments */
  @Get(`/`)
  @UseGuards(UserAuthGuard)
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

    const treatments = await this.treatmentsService.findAll({
      search,
      pagination,
      organizationId: user?.organizationId,
    });

    return reply({ res, results: treatments });
  }

  /** Post one treatment */
  @Post(`/create`)
  @UseGuards(UserAuthGuard)
  async createOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateTreatmentsDto,
  ) {
    const { user } = req;
    const { note, dose, name, date, medication, diagnosis, animalId } = body;

    const findOneAnimal = await this.animalsService.findOneBy({
      animalId,
      organizationId: user.organizationId,
    });
    if (!findOneAnimal)
      throw new HttpException(
        `Animal ${animalId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const treatment = await this.treatmentsService.createOne({
      note,
      date,
      name,
      dose,
      diagnosis,
      medication,
      animalId: findOneAnimal?.id,
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
    });

    return reply({ res, results: treatment });
  }

  /** Update one reatment */
  @Put(`/:treatmentId/edit`)
  @UseGuards(UserAuthGuard)
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateTreatmentsDto,
    @Param('treatmentId', ParseUUIDPipe) treatmentId: string,
  ) {
    const { user } = req;
    const { note, date, name, dose, diagnosis, medication, animalId } = body;

    const findOneTreatement = await this.treatmentsService.findOneBy({
      treatmentId,
      organizationId: user?.organizationId,
    });
    if (!findOneTreatement) {
      throw new HttpException(
        `TreatmentId: ${treatmentId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    const findOneAnimal = await this.animalsService.findOneBy({
      animalId,
    });
    if (!findOneAnimal)
      throw new HttpException(
        `Animal ${animalId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const treatment = await this.treatmentsService.updateOne(
      { treatmentId: findOneTreatement?.id },
      {
        note,
        date,
        name,
        dose,
        diagnosis,
        medication,
        animalId: findOneAnimal?.id,
        organizationId: user?.organizationId,
        userCreatedId: user?.id,
      },
    );

    return reply({ res, results: treatment });
  }

  /** Get one treatment */
  @Get(`/:slug/view`)
  @UseGuards(UserAuthGuard)
  async getOneByIdTreatment(
    @Res() res,
    @Res() req,
    @Param('slug', ParseUUIDPipe) treatmentId: string,
  ) {
    const { user } = req;

    const findOneTreatement = await this.treatmentsService.findOneBy({
      treatmentId,
      organizationId: user?.organizationId,
    });
    if (!findOneTreatement) {
      throw new HttpException(
        `TreatmentId: ${treatmentId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    return reply({ res, results: findOneTreatement });
  }

  /** Delete one treatment */
  @Delete(`/delete/:treatmentId`)
  @UseGuards(UserAuthGuard)
  async deleteOne(
    @Res() res,
    @Req() req,
    @Param('treatmentId', ParseUUIDPipe) treatmentId: string,
  ) {
    const { user } = req;

    const findOneTreatement = await this.treatmentsService.findOneBy({
      treatmentId,
      organizationId: user?.organizationId,
    });
    if (!findOneTreatement) {
      throw new HttpException(
        `TreatmentId: ${treatmentId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    const treatment = await this.treatmentsService.updateOne(
      { treatmentId: findOneTreatement?.id },
      { deletedAt: new Date() },
    );

    return reply({ res, results: treatment });
  }
}
