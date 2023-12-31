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

import { DiagnosisService } from './diagnosis.service';
import { SearchQueryDto } from '../../app/utils/search-query/search-query.dto';
import { CreateOrUpdateDiagnosisDto } from './diagnosis.dto';
import { RequestPaginationDto } from '../../app/utils/pagination/request-pagination.dto';
import {
  addPagination,
  PaginationType,
} from '../../app/utils/pagination/with-pagination';
import { JwtAuthGuard } from '../users/middleware';

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

  /** Post one Diagnosis */
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

    const medication = await this.diagnosisService.updateOne(
      { diagnosisId },
      {
        name,
        organizationId: user?.organizationId,
        userCreatedId: user?.id,
      },
    );

    return reply({ res, results: medication });
  }

  /** Get one Diagnosis */
  @Get(`/view`)
  @UseGuards(JwtAuthGuard)
  async getOneByIdUser(
    @Res() res,
    @Query('diagnosisId', ParseUUIDPipe) diagnosisId: string,
  ) {
    const medication = await this.diagnosisService.findOneBy({
      diagnosisId,
    });

    return reply({ res, results: medication });
  }

  /** Delete one Diagnosis */
  @Delete(`/delete/:diagnosisId`)
  @UseGuards(JwtAuthGuard)
  async deleteOne(
    @Res() res,
    @Param('diagnosisId', ParseUUIDPipe) diagnosisId: string,
  ) {
    const medication = await this.diagnosisService.updateOne(
      { diagnosisId },
      { deletedAt: new Date() },
    );

    return reply({ res, results: medication });
  }
}
