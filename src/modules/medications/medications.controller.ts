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
import { CreateOrUpdateMedicationsDto } from './medications.dto';
import { MedicationsService } from './medications.service';

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

  /** Post one Medication */
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
    const findOneMedication = await this.medicationsService.updateOne(
      { medicationId },
      {
        name,
        organizationId: user?.organizationId,
        userCreatedId: user?.id,
      },
    );

    if (!findOneMedication) {
      throw new HttpException(
        ` ${medicationId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    return reply({ res, results: findOneMedication });
  }

  /** Get one Medication */
  @Get(`/view`)
  @UseGuards(JwtAuthGuard)
  async getOneByIdUser(
    @Res() res,
    @Res() req,
    @Query('medicationId', ParseUUIDPipe) medicationId: string,
  ) {
    const findOneMedication = await this.medicationsService.findOneBy({
      medicationId,
    });
    if (!findOneMedication) {
      throw new HttpException(
        ` ${medicationId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    return reply({ res, results: findOneMedication });
  }

  /** Delete one medication */
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
