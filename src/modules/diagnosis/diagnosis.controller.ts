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

  /** Post one Diagnosis */
  @Post(`/`)
  @UseGuards(JwtAuthGuard)
  async createOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateDiagnosisDto,
  ) {
    const { user } = req;
    const { name } = body;

    const medication = await this.diagnosisService.createOne({
      name,
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
    });

    return reply({ res, results: medication });
  }

  /** Update one Diagnosis */
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
    });

    if (!diagnosisId) {
      throw new HttpException(
        `${diagnosisId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    await this.diagnosisService.updateOne(
      { diagnosisId },
      {
        name,
        organizationId: user?.organizationId,
        userCreatedId: user?.id,
      },
    );

    return reply({ res, results: findOneDiagnosis });
  }

  /** Get one Diagnosis */
  @Get(`/view`)
  @UseGuards(JwtAuthGuard)
  async getOneByIdUser(
    @Res() res,
    @Query('diagnosisId', ParseUUIDPipe) diagnosisId: string,
  ) {
    const findOneDiagnosis = await this.diagnosisService.findOneBy({
      diagnosisId,
    });

    if (!diagnosisId) {
      throw new HttpException(
        `${diagnosisId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    return reply({ res, results: findOneDiagnosis });
  }

  /** Delete one Diagnosis */
  @Delete(`/delete/:diagnosisId`)
  @UseGuards(JwtAuthGuard)
  async deleteOne(
    @Res() res,
    @Param('diagnosisId', ParseUUIDPipe) diagnosisId: string,
  ) {
    const findOneDiagnosis = await this.diagnosisService.updateOne(
      { diagnosisId },
      { deletedAt: new Date() },
    );

    if (!diagnosisId) {
      throw new HttpException(
        `${diagnosisId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    return reply({ res, results: findOneDiagnosis });
  }
}
