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
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { AnimalsService } from '../animals/animals.service';
import { AssignTypesService } from '../assigne-type/assigne-type.service';
import { UserAuthGuard } from '../users/middleware';
import {
  BulkTreatmentsDto,
  CreateOrUpdateTreatmentsDto,
  TreatmentDto,
} from './treatments.dto';
import { TreatmentsService } from './treatments.service';

@Controller('treatments')
export class TreatmentsController {
  constructor(
    private readonly treatmentsService: TreatmentsService,
    private readonly animalsService: AnimalsService,
    private readonly activitylogsService: ActivityLogsService,
    private readonly assignTypesService: AssignTypesService,
  ) {}

  /** Get all Treatments */
  @Get(`/`)
  @UseGuards(UserAuthGuard)
  async findAll(
    @Res() res,
    @Req() req,
    @Query() requestPaginationDto: RequestPaginationDto,
    @Query() query: SearchQueryDto,
    @Query() queryTreatment: TreatmentDto,
  ) {
    const { user } = req;
    const { search } = query;
    const { animalTypeId } = queryTreatment;

    const { take, page, sort, sortBy } = requestPaginationDto;
    const pagination: PaginationType = addPagination({
      page,
      take,
      sort,
      sortBy,
    });

    const treatments = await this.treatmentsService.findAll({
      search,
      pagination,
      animalTypeId,
      organizationId: user.organizationId,
    });

    return reply({ res, results: treatments });
  }

  /** Post one Bulk death */
  @Post(`/bulk/create`)
  @UseGuards(UserAuthGuard)
  async createOneBulk(@Res() res, @Req() req, @Body() body: BulkTreatmentsDto) {
    const { user } = req;
    const { note, name, dose, animals, diagnosis, medication } = body;

    for (const animal of animals) {
      const findOneAnimal = await this.animalsService.findOneBy({
        code: animal.code,
        organizationId: user.organizationId,
      });
      if (!findOneAnimal)
        throw new HttpException(
          `Animal ${findOneAnimal?.code} doesn't exists please change`,
          HttpStatus.NOT_FOUND,
        );

      await this.treatmentsService.createOne({
        note,
        name,
        dose,
        diagnosis,
        medication,
        animalId: findOneAnimal.id,
        animalTypeId: findOneAnimal.animalTypeId,
        organizationId: user.organizationId,
        userCreatedId: user.id,
      });

      await this.activitylogsService.createOne({
        userId: user.id,
        organizationId: user.organizationId,
        message: `${user.profile?.firstName} ${user.profile?.lastName} treated ${animals.length} ${findOneAnimal.animalType.name}`,
      });
    }

    return reply({ res, results: 'Saved' });
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
    const { note, name, dose, diagnosis, medication, animalTypeId } = body;

    const findOneAssignType = await this.assignTypesService.findOneBy({
      animalTypeId,
      organizationId: user.organizationId,
    });
    if (!findOneAssignType)
      throw new HttpException(
        `AnimalType not assigned please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneTreatement = await this.treatmentsService.findOneBy({
      treatmentId,
      organizationId: user.organizationId,
      animalTypeId: findOneAssignType.animalTypeId,
    });
    if (!findOneTreatement)
      throw new HttpException(
        `TreatmentId: ${treatmentId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const treatment = await this.treatmentsService.updateOne(
      { treatmentId: findOneTreatement.id },
      {
        note,
        name,
        dose,
        diagnosis,
        medication,
        organizationId: user.organizationId,
        userCreatedId: user.id,
      },
    );

    await this.activitylogsService.createOne({
      userId: user.id,
      organizationId: user.organizationId,
      message: `${user.profile?.firstName} ${user.profile?.lastName} updated a treatment for animal ${findOneTreatement.animal.code}`,
    });

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
      organizationId: user.organizationId,
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
      organizationId: user.organizationId,
    });
    if (!findOneTreatement)
      throw new HttpException(
        `TreatmentId: ${treatmentId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    await this.activitylogsService.createOne({
      userId: user.id,
      organizationId: user.organizationId,
      message: `${user.profile?.firstName} ${user.profile?.lastName} deleted a treatment for animal ${findOneTreatement.animal.code}`,
    });

    await this.treatmentsService.updateOne(
      { treatmentId: findOneTreatement.id },
      { deletedAt: new Date() },
    );

    return reply({ res, results: 'Treatment deleted successfully' });
  }
}
