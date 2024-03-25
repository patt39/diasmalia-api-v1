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
import { BatchsService } from '../batchs/batchs.service';
import { UserAuthGuard } from '../users/middleware';
import { CreateOrUpdateTreatmentsDto } from './treatments.dto';
import { TreatmentsService } from './treatments.service';

@Controller('treatments')
export class TreatmentsController {
  constructor(
    private readonly treatmentsService: TreatmentsService,
    private readonly batchsService: BatchsService,
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
    const { note, dose, name, date, medication, diagnosis, batchId } = body;

    const findOneBatch = await this.batchsService.findOneBy({
      batchId,
    });
    if (!findOneBatch)
      throw new HttpException(
        `BatchId: ${batchId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const treatment = await this.treatmentsService.createOne({
      note,
      date,
      name,
      dose,
      diagnosis,
      medication,
      batchId: findOneBatch?.id,
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
    });

    return reply({ res, results: treatment });
  }

  /** Update one treatment */
  @Put(`/:treatmentId/edit`)
  @UseGuards(UserAuthGuard)
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateTreatmentsDto,
    @Param('treatmentId', ParseUUIDPipe) treatmentId: string,
  ) {
    const { user } = req;
    const { note, date, name, dose, diagnosis, medication, batchId } = body;

    const findOneTreatement = await this.treatmentsService.findOneBy({
      treatmentId,
      organizationId: user?.organizationId,
    });
    if (!findOneTreatement)
      throw new HttpException(
        `TreatmentId: ${treatmentId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneBatch = await this.batchsService.findOneBy({
      batchId,
    });
    if (!findOneBatch)
      throw new HttpException(
        `BatchId: ${batchId} doesn't exists please change`,
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
        batchId: findOneBatch?.id,
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
    if (!findOneTreatement)
      throw new HttpException(
        `TreatmentId: ${treatmentId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

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
    if (!findOneTreatement)
      throw new HttpException(
        `TreatmentId: ${treatmentId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    await this.treatmentsService.updateOne(
      { treatmentId: findOneTreatement?.id },
      { deletedAt: new Date() },
    );

    return reply({ res, results: 'Treatment deleted successfully' });
  }
}
