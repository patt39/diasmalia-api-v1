import {
  Controller,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  Delete,
  Res,
  Req,
  Get,
  Query,
  UseGuards,
  Put,
} from '@nestjs/common';
import { reply } from '../../app/utils/reply';

import { TreatmentsService } from './treatments.service';
import { SearchQueryDto } from '../../app/utils/search-query/search-query.dto';
import { CreateOrUpdateTreatmentsDto } from './treatments.dto';
import { RequestPaginationDto } from '../../app/utils/pagination/request-pagination.dto';
import {
  addPagination,
  PaginationType,
} from '../../app/utils/pagination/with-pagination';
import { JwtAuthGuard } from '../users/middleware';

@Controller('treatments')
export class TreatmentsController {
  constructor(private readonly treatmentsService: TreatmentsService) {}

  /** Get all Treatments */
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

    const treatments = await this.treatmentsService.findAll({
      search,
      pagination,
      organizationId: user?.organizationId,
    });

    return reply({ res, results: treatments });
  }

  /** Post one Treatments */
  @Post(`/`)
  @UseGuards(JwtAuthGuard)
  async createOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateTreatmentsDto,
  ) {
    const { user } = req;
    const {
      numberOfDose,
      treatmentName,
      treatmentDate,
      medicationId,
      note,
      diagnosisId,
      animalId,
    } = body;

    const treatment = await this.treatmentsService.createOne({
      numberOfDose,
      treatmentName,
      treatmentDate,
      medicationId,
      note,
      diagnosisId,
      animalId,
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
    });

    return reply({ res, results: treatment });
  }

  /** Post one Treatments */
  @Put(`/:TreatmentId`)
  @UseGuards(JwtAuthGuard)
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateTreatmentsDto,
    @Param('treatmentId', ParseUUIDPipe) treatmentId: string,
  ) {
    const { user } = req;
    const {
      numberOfDose,
      treatmentName,
      treatmentDate,
      medicationId,
      note,
      diagnosisId,
      animalId,
    } = body;

    const treatment = await this.treatmentsService.updateOne(
      { treatmentId },
      {
        numberOfDose,
        treatmentName,
        treatmentDate,
        medicationId,
        note,
        diagnosisId,
        animalId,
        organizationId: user?.organizationId,
        userCreatedId: user?.id,
      },
    );

    return reply({ res, results: treatment });
  }

  /** Get one Treatments */
  @Get(`/view`)
  @UseGuards(JwtAuthGuard)
  async getOneByIdUser(
    @Res() res,
    @Query('treatmentId', ParseUUIDPipe) treatmentId: string,
  ) {
    const treatment = await this.treatmentsService.findOneBy({
      treatmentId,
    });

    return reply({ res, results: treatment });
  }

  /** Delete one Treatments */
  @Delete(`/delete/:treatmentId`)
  @UseGuards(JwtAuthGuard)
  async deleteOne(
    @Res() res,
    @Param('treatmentId', ParseUUIDPipe) treatmentId: string,
  ) {
    const treatment = await this.treatmentsService.updateOne(
      { treatmentId },
      { deletedAt: new Date() },
    );

    return reply({ res, results: treatment });
  }
}
