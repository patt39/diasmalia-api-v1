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
import { JwtAuthGuard } from '../users/middleware';
import { CreateOrUpdateDiagnosisDto } from './diagnosis.dto';
import { DiagnosisService } from './diagnosis.service';

@Controller('diagnosis')
export class DiagnosisController {
  constructor(private readonly diagnosisService: DiagnosisService) {}

  /** Get all Diagnosis */
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

    const Diagnosis = await this.diagnosisService.findAll({
      search,
      pagination,
      organizationId: user?.organizationId,
    });

    return reply({ res, results: Diagnosis });
  }

  /** Post one diagnosis */
  @Post(`/`)
  @UseGuards(JwtAuthGuard)
  async createOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateDiagnosisDto,
  ) {
    const { user } = req;
    const { name } = body;

    const findOneDiagnosis = await this.diagnosisService.findOneBy({
      name,
      organizationId: user?.organizationId,
    });
    if (findOneDiagnosis) {
      throw new HttpException(
        `Diagnosis ${name} already exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    const diagnosis = await this.diagnosisService.createOne({
      name,
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
    });

    return reply({ res, results: diagnosis });
  }

  /** Update one diagnosis */
  @Put(`/:diagnosisId`)
  @UseGuards(JwtAuthGuard)
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateDiagnosisDto,
    @Param('diagnosisId', ParseUUIDPipe) diagnosisId: string,
  ) {
    const { user } = req;
    const { name } = body;

    const findOneDiagnosis = await this.diagnosisService.findOneBy({
      diagnosisId,
      organizationId: user?.organizationId,
    });
    if (!diagnosisId) {
      throw new HttpException(
        `${diagnosisId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    await this.diagnosisService.updateOne(
      { diagnosisId: findOneDiagnosis?.id },
      {
        name,
        organizationId: user?.organizationId,
        userCreatedId: user?.id,
      },
    );

    return reply({ res, results: findOneDiagnosis });
  }

  /** Get one diagnosis */
  @Get(`/view`)
  @UseGuards(JwtAuthGuard)
  async getOneByIdDiagnosis(
    @Res() res,
    @Req() req,
    @Query('diagnosisId', ParseUUIDPipe) diagnosisId: string,
  ) {
    const { user } = req;
    const findOneDiagnosis = await this.diagnosisService.findOneBy({
      diagnosisId,
      organizationId: user?.organizationId,
    });
    if (!diagnosisId) {
      throw new HttpException(
        `${diagnosisId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    return reply({ res, results: findOneDiagnosis });
  }

  /** Delete one diagnosis */
  @Delete(`/delete/:diagnosisId`)
  @UseGuards(JwtAuthGuard)
  async deleteOne(
    @Res() res,
    @Req() req,
    @Param('diagnosisId', ParseUUIDPipe) diagnosisId: string,
  ) {
    const { user } = req;
    const findOneDiagnosis = await this.diagnosisService.findOneBy({
      diagnosisId,
      organizationId: user?.organizationId,
    });
    if (!diagnosisId) {
      throw new HttpException(
        `${diagnosisId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    await this.diagnosisService.updateOne(
      { diagnosisId: findOneDiagnosis.id },
      { deletedAt: new Date() },
    );

    return reply({ res, results: findOneDiagnosis });
  }
}
