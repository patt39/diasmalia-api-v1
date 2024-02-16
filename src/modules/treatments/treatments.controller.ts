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
import { DiagnosisService } from '../diagnosis/diagnosis.service';
import { MedicationsService } from '../medications/medications.service';
import { JwtAuthGuard } from '../users/middleware';
import { CreateOrUpdateTreatmentsDto } from './treatments.dto';
import { TreatmentsService } from './treatments.service';

@Controller('treatments')
export class TreatmentsController {
  constructor(
    private readonly treatmentsService: TreatmentsService,
    private readonly diagnosisService: DiagnosisService,
    private readonly medicationsService: MedicationsService,
    private readonly animalsService: AnimalsService,
  ) {}

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

  /** Post one treatment */
  @Post(`/`)
  @UseGuards(JwtAuthGuard)
  async createOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateTreatmentsDto,
  ) {
    const { user } = req;
    const {
      note,
      numberOfDose,
      treatmentName,
      treatmentDate,
      medicationId,
      diagnosisId,
      animalId,
    } = body;

    const findOneAnimal = await this.animalsService.findOneBy({
      animalId,
      organizationId: user.organizationId,
    });
    if (!findOneAnimal)
      throw new HttpException(
        `Animal ${animalId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneDiagnosis = await this.diagnosisService.findOneBy({
      diagnosisId,
    });
    if (!findOneDiagnosis) {
      throw new HttpException(
        `${diagnosisId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    const findOneMedication = await this.medicationsService.findOneBy({
      medicationId,
      organizationId: user.organizationId,
    });
    if (!findOneMedication) {
      throw new HttpException(
        ` ${medicationId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    const treatment = await this.treatmentsService.createOne({
      note,
      numberOfDose,
      treatmentName,
      treatmentDate,
      diagnosisId: findOneDiagnosis.id,
      animalId: findOneAnimal.id,
      medicationId: findOneMedication.id,
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
    });

    return reply({ res, results: treatment });
  }

  /** Update one reatment */
  @Put(`/:treatmentId`)
  @UseGuards(JwtAuthGuard)
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateTreatmentsDto,
    @Param('treatmentId', ParseUUIDPipe) treatmentId: string,
  ) {
    const { user } = req;
    const {
      note,
      numberOfDose,
      treatmentName,
      treatmentDate,
      medicationId,
      diagnosisId,
      animalId,
    } = body;

    const findOneTreatement = await this.treatmentsService.findOneBy({
      treatmentId,
    });
    if (!findOneTreatement) {
      throw new HttpException(
        ` ${treatmentId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    const findOneAnimal = await this.animalsService.findOneBy({
      animalId,
      organizationId: user?.organizationId,
    });
    if (!findOneAnimal)
      throw new HttpException(
        `Animal ${animalId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneDiagnosis = await this.diagnosisService.findOneBy({
      diagnosisId,
      organizationId: user?.organizationId,
    });
    if (!findOneDiagnosis) {
      throw new HttpException(
        `${diagnosisId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    const findOneMedication = await this.medicationsService.findOneBy({
      medicationId,
      organizationId: user?.organizationId,
    });
    if (!findOneMedication) {
      throw new HttpException(
        ` ${medicationId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    const treatment = await this.treatmentsService.updateOne(
      { treatmentId: findOneTreatement.id },
      {
        note,
        numberOfDose,
        treatmentName,
        treatmentDate,
        diagnosisId: findOneDiagnosis.id,
        animalId: findOneAnimal.id,
        medicationId: findOneMedication.id,
        organizationId: user?.organizationId,
        userCreatedId: user?.id,
        updatedAt: new Date(),
      },
    );

    return reply({ res, results: treatment });
  }

  /** Get one treatment */
  @Get(`/view`)
  @UseGuards(JwtAuthGuard)
  async getOneByIdTreatment(
    @Res() res,
    @Res() req,
    @Query('treatmentId', ParseUUIDPipe) treatmentId: string,
  ) {
    const { user } = req;

    const findOneTreatement = await this.treatmentsService.findOneBy({
      treatmentId,
      organizationId: user?.organizationId,
    });
    if (!findOneTreatement) {
      throw new HttpException(
        ` ${treatmentId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    return reply({ res, results: findOneTreatement });
  }

  /** Delete one treatment */
  @Delete(`/delete/:treatmentId`)
  @UseGuards(JwtAuthGuard)
  async deleteOne(
    @Res() res,
    @Req() req,
    @Param('treatmentId', ParseUUIDPipe) treatmentId: string,
  ) {
    const { user } = req;

    const findOneTreatement = await this.treatmentsService.findOneBy({
      treatmentId,
      organizationId: user.organizationId,
    });
    if (!findOneTreatement) {
      throw new HttpException(
        `${treatmentId} doesn't exists please change`,
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
