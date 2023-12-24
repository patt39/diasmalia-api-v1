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

import { MedicationsService } from './medications.service';
import { SearchQueryDto } from '../../app/utils/search-query/search-query.dto';
import { CreateOrUpdateMedicationsDto } from './medications.dto';
import { RequestPaginationDto } from '../../app/utils/pagination/request-pagination.dto';
import {
  addPagination,
  PaginationType,
} from '../../app/utils/pagination/with-pagination';
import { JwtAuthGuard } from '../users/middleware';

@Controller('medications')
export class MedicationsController {
  constructor(private readonly medicationsService: MedicationsService) {}

  /** Get all Medications */
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

    const medications = await this.medicationsService.findAll({
      search,
      pagination,
      organizationId: user?.organizationId,
    });

    return reply({ res, results: medications });
  }

  /** Post one Medications */
  @Post(`/`)
  @UseGuards(JwtAuthGuard)
  async createOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateMedicationsDto,
  ) {
    const { user } = req;
    const { name } = body;

    const medication = await this.medicationsService.createOne({
      name,
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
    });

    return reply({ res, results: medication });
  }

  /** Post one Medications */
  @Put(`/:medicationId`)
  @UseGuards(JwtAuthGuard)
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateMedicationsDto,
    @Param('medicationId', ParseUUIDPipe) medicationId: string,
  ) {
    const { user } = req;
    const { name } = body;

    const medication = await this.medicationsService.updateOne(
      { medicationId },
      {
        name,
        organizationId: user?.organizationId,
        userCreatedId: user?.id,
      },
    );

    return reply({ res, results: medication });
  }

  /** Get one Medications */
  @Get(`/view`)
  @UseGuards(JwtAuthGuard)
  async getOneByIdUser(
    @Res() res,
    @Query('medicationId', ParseUUIDPipe) medicationId: string,
  ) {
    const medication = await this.medicationsService.findOneBy({
      medicationId,
    });

    return reply({ res, results: medication });
  }

  /** Delete one Medications */
  @Delete(`/delete/:medicationId`)
  @UseGuards(JwtAuthGuard)
  async deleteOne(
    @Res() res,
    @Param('medicationId', ParseUUIDPipe) medicationId: string,
  ) {
    const medication = await this.medicationsService.updateOne(
      { medicationId },
      { deletedAt: new Date() },
    );

    return reply({ res, results: medication });
  }
}
