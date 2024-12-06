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

import { formatDateDifference } from '../../app/utils/commons';
import { RequestPaginationDto } from '../../app/utils/pagination/request-pagination.dto';
import {
  addPagination,
  PaginationType,
} from '../../app/utils/pagination/with-pagination';
import { SearchQueryDto } from '../../app/utils/search-query/search-query.dto';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { AnimalsService } from '../animals/animals.service';
import { HealthsService } from '../health/health.service';
import { SuggestionService } from '../suggestions/suggestions.service';
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
    private readonly healthsService: HealthsService,
    private readonly suggestionsService: SuggestionService,
    private readonly activitylogsService: ActivityLogsService,
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
    const { animalTypeId, periode, animalId } = queryTreatment;

    const { take, page, sort, sortBy } = requestPaginationDto;
    const pagination: PaginationType = addPagination({
      page,
      take,
      sort,
      sortBy,
    });

    const treatments = await this.treatmentsService.findAll({
      search,
      animalId,
      pagination,
      animalTypeId,
      periode: Number(periode),
      organizationId: user.organizationId,
    });

    return reply({ res, results: treatments });
  }

  /** Post one aves treatment */
  @Post(`/create/aves`)
  @UseGuards(UserAuthGuard)
  async createOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateTreatmentsDto,
  ) {
    const { user } = req;
    const { code, note, name, dose, method, diagnosis, healthId } = body;

    const findOneAnimal = await this.animalsService.findOneByCode({
      code,
      status: 'ACTIVE',
      organizationId: user?.organizationId,
    });
    if (!findOneAnimal)
      throw new HttpException(
        `Animal ${findOneAnimal?.code} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const findMedication = await this.healthsService.findOneBy({
      healthId,
      status: 'true',
      organizationId: user?.organizationId,
    });
    if (!findMedication)
      throw new HttpException(
        `Medication: ${findMedication?.name} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    if (findOneAnimal?.quantity === 0)
      throw new HttpException(
        `Unable to treat, animals doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const treatment = await this.treatmentsService.createOne({
      note,
      name,
      dose,
      method,
      diagnosis,
      animalId: findOneAnimal?.id,
      healthId: findMedication?.id,
      animalTypeId: findOneAnimal?.animalTypeId,
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
    });

    if (
      findOneAnimal?.productionPhase === 'GROWTH' &&
      formatDateDifference(findOneAnimal?.birthday) === '1 days' &&
      ['Pondeuses', 'Poulets de chair'].includes(
        findOneAnimal?.animalType?.name,
      )
    ) {
      await this.suggestionsService.createOne({
        userId: user?.id,
        animalId: findOneAnimal?.id,
        organizationId: user?.organizationId,
        title: `Soins pour la bande ${findOneAnimal?.code} de ${findOneAnimal?.animalType?.name}`,
        message: `Administer les vaccins pour la Maladie de Marek : Injection. Newcastle (HB1) et Bronchite infectieuse : Gouttes oculaires pour développer une bonne immunité et favoriser une croissance saine.`,
      });
    }

    if (
      findOneAnimal?.productionPhase === 'GROWTH' &&
      formatDateDifference(findOneAnimal?.birthday) === '7 days' &&
      ['Pondeuses', 'Poulets de chair'].includes(
        findOneAnimal?.animalType?.name,
      )
    ) {
      await this.suggestionsService.createOne({
        userId: user?.id,
        animalId: findOneAnimal?.id,
        organizationId: user?.organizationId,
        title: `Soins pour la bande ${findOneAnimal?.code} de ${findOneAnimal?.animalType?.name}`,
        message: `Administer le vaccin pour le Gumboro (IBD) : Gouttes oculaires ou eau de boisson une bonne immunité et favoriser une croissance saine.`,
      });
    }

    if (
      findOneAnimal?.productionPhase === 'GROWTH' &&
      formatDateDifference(findOneAnimal?.birthday) === '21 days' &&
      ['Pondeuses', 'Poulets de chair'].includes(
        findOneAnimal?.animalType?.name,
      )
    ) {
      await this.suggestionsService.createOne({
        userId: user?.id,
        animalId: findOneAnimal?.id,
        organizationId: user?.organizationId,
        title: `Soins pour la bande ${findOneAnimal?.code} de ${findOneAnimal?.animalType?.name}`,
        message: `Administer les rappels de vaccins contre les maladies de Newcastle et Gumboro et preparer le rappel pour la coccidiose si necessaire selon la localité`,
      });
    }

    if (
      findOneAnimal?.productionPhase === 'GROWTH' &&
      formatDateDifference(findOneAnimal?.birthday) === '14 days' &&
      ['Pondeuses'].includes(findOneAnimal?.animalType?.name)
    ) {
      await this.suggestionsService.createOne({
        userId: user?.id,
        animalId: findOneAnimal?.id,
        organizationId: user?.organizationId,
        title: `Soins pour la bande ${findOneAnimal?.code} de ${findOneAnimal?.animalType?.name}`,
        message: `Administer la deuxième dose de vaccin contre la maladie de newcastle pour développer une bonne immunité et favoriser une croissance saine`,
      });
    }

    if (
      findOneAnimal?.productionPhase === 'GROWTH' &&
      formatDateDifference(findOneAnimal?.birthday) === '14 days' &&
      ['Pondeuses'].includes(findOneAnimal?.animalType?.name)
    ) {
      await this.suggestionsService.createOne({
        userId: user?.id,
        animalId: findOneAnimal?.id,
        organizationId: user?.organizationId,
        title: `Soins pour la bande ${findOneAnimal?.code} de ${findOneAnimal?.animalType?.name}`,
        message: `Administer le vaccin contre Bronchite Infectieuse : Eau de boisson ou pulvérisation et la deuxième dose de vaccin contre le Gumboro. Gumboro : Deuxième dose.`,
      });
    }

    if (
      findOneAnimal?.productionPhase === 'GROWTH' &&
      formatDateDifference(findOneAnimal?.birthday) === '1 mths' &&
      ['Pondeuses'].includes(findOneAnimal?.animalType?.name)
    ) {
      await this.suggestionsService.createOne({
        userId: user?.id,
        animalId: findOneAnimal?.id,
        organizationId: user?.organizationId,
        title: `Soins pour la bande ${findOneAnimal?.code} de ${findOneAnimal?.animalType?.name}`,
        message: `Administer les vaccins Variole aviaire : Injection sous-cutanée. Coryza infectieuse : Injection intramusculaire si la maladie est présente dans la région.`,
      });
    }

    if (
      findOneAnimal?.productionPhase === 'GROWTH' &&
      formatDateDifference(findOneAnimal?.birthday) === '3 mths' &&
      ['Pondeuses'].includes(findOneAnimal?.animalType?.name)
    ) {
      await this.suggestionsService.createOne({
        userId: user?.id,
        animalId: findOneAnimal?.id,
        organizationId: user?.organizationId,
        title: `Soins pour la bande ${findOneAnimal?.code} de ${findOneAnimal?.animalType?.name}`,
        message: `Administer les vaccins contre le Newcastle (Lasota) : Renforcement par eau de boisson. Bronchite infectieuse : Renforcement.`,
      });
    }

    if (
      findOneAnimal?.productionPhase === 'GROWTH' &&
      formatDateDifference(findOneAnimal?.birthday) === '4 mths' &&
      ['Pondeuses'].includes(findOneAnimal?.animalType?.name)
    ) {
      await this.suggestionsService.createOne({
        userId: user?.id,
        animalId: findOneAnimal?.id,
        organizationId: user?.organizationId,
        title: `Soins pour la bande ${findOneAnimal?.code} de ${findOneAnimal?.animalType?.name}`,
        message: `Administer les vaccins contre Newcastle (Clone 30) et Bronchite infectieuse : Dernier rappel pour préparer les poules à une production optimale d'œufs`,
      });
    }

    if (
      findOneAnimal?.productionPhase === 'LAYING' &&
      formatDateDifference(findOneAnimal?.birthday) === '5 mths' &&
      ['Pondeuses'].includes(findOneAnimal?.animalType?.name)
    ) {
      await this.suggestionsService.createOne({
        userId: user?.id,
        animalId: findOneAnimal?.id,
        organizationId: user?.organizationId,
        title: `Soins pour la bande ${findOneAnimal?.code} de ${findOneAnimal?.animalType?.name}`,
        message: `Administer les vaccins contre Salmonellose : Vaccin si requis localement pour assurer une production constante et prévenir les maladies.`,
      });
    }

    if (
      findOneAnimal?.productionPhase === 'LAYING' &&
      formatDateDifference(findOneAnimal?.birthday) === '8 mths' &&
      ['Pondeuses'].includes(findOneAnimal?.animalType?.name)
    ) {
      await this.suggestionsService.createOne({
        userId: user?.id,
        animalId: findOneAnimal?.id,
        organizationId: user?.organizationId,
        title: `Soins pour la bande ${findOneAnimal?.code} de ${findOneAnimal?.animalType?.name}`,
        message: `Administer les vaccins contre Newcastle et Bronchite infectieuse : Rappel pour assurer une production constante et prévenir les maladies.`,
      });
    }

    await this.activitylogsService.createOne({
      userId: user?.id,
      message: `${user?.profile?.firstName} ${user?.profile?.lastName} added a treatment in ${findOneAnimal?.animalType?.name} for ${findOneAnimal?.code} `,
      organizationId: user?.organizationId,
    });

    return reply({
      res,
      results: {
        status: HttpStatus.CREATED,
        data: treatment,
        message: `Treatment Created Successfully`,
      },
    });
  }

  /** Post one Bulk death */
  @Post(`/bulk/create`)
  @UseGuards(UserAuthGuard)
  async createOneBulk(@Res() res, @Req() req, @Body() body: BulkTreatmentsDto) {
    const { user } = req;
    const { note, name, dose, animals, diagnosis, healthId, method } = body;

    for (const animal of animals) {
      const findOneAnimal = await this.animalsService.findOneBy({
        code: animal,
        organizationId: user?.organizationId,
      });
      if (!findOneAnimal)
        throw new HttpException(
          `Animal ${findOneAnimal?.code} doesn't exists please change`,
          HttpStatus.NOT_FOUND,
        );

      const findMedication = await this.healthsService.findOneBy({
        healthId,
        status: 'true',
        organizationId: user?.organizationId,
      });
      if (!findMedication)
        throw new HttpException(
          `Medication: ${findMedication?.name} doesn't exists please change`,
          HttpStatus.NOT_FOUND,
        );

      await this.treatmentsService.createOne({
        note,
        name,
        dose,
        method,
        diagnosis,
        animalId: findOneAnimal?.id,
        healthId: findMedication?.id,
        animalTypeId: findOneAnimal?.animalTypeId,
        organizationId: user?.organizationId,
        userCreatedId: user?.id,
      });

      await this.activitylogsService.createOne({
        userId: user?.id,
        organizationId: user?.organizationId,
        message: `${user?.profile?.firstName} ${user?.profile?.lastName} treated ${findOneAnimal?.code} in ${findOneAnimal?.animalType?.name}`,
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
    const { code, note, name, dose, diagnosis, healthId, method } = body;

    const findOneTreatement = await this.treatmentsService.findOneBy({
      treatmentId,
      organizationId: user?.organizationId,
    });
    if (!findOneTreatement)
      throw new HttpException(
        `TreatmentId: ${treatmentId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneAnimal = await this.animalsService.findOneByCode({
      code,
      status: 'ACTIVE',
      organizationId: user?.organizationId,
    });
    if (!findOneAnimal)
      throw new HttpException(
        `Animal ${findOneAnimal?.code} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const findMedication = await this.healthsService.findOneBy({
      healthId,
      organizationId: user?.organizationId,
    });
    if (!findMedication)
      throw new HttpException(
        `Medication: ${findMedication?.name} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const treatment = await this.treatmentsService.updateOne(
      { treatmentId: findOneTreatement?.id },
      {
        note,
        name,
        dose,
        method,
        diagnosis,
        animalId: code ? findOneAnimal?.id : code,
        healthId: findMedication?.id,
        organizationId: user?.organizationId,
        userCreatedId: user?.id,
      },
    );

    await this.activitylogsService.createOne({
      userId: user?.id,
      organizationId: user?.organizationId,
      message: `${user?.profile?.firstName} ${user?.profile?.lastName} updated a treatment for animal ${findOneTreatement?.animal?.code} in ${findOneTreatement?.animalType?.name}`,
    });

    return reply({ res, results: treatment });
  }

  /** Get one treatment */
  @Get(`/:treatmentId/view`)
  @UseGuards(UserAuthGuard)
  async getOneByIdTreatment(
    @Res() res,
    @Res() req,
    @Param('treatmentId', ParseUUIDPipe) treatmentId: string,
  ) {
    const { user } = req;

    const findOneTreatement = await this.treatmentsService.findOneBy({
      treatmentId,
      animalTypeId: user?.animalTypeId,
      organizationId: user?.organizationId,
    });
    if (!findOneTreatement)
      throw new HttpException(
        `TreatmentId: ${treatmentId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    return reply({ res, results: findOneTreatement });
  }

  /** Get one treatment by animalId */
  @Get(`/:animalId/view/treatment`)
  @UseGuards(UserAuthGuard)
  async getOneByAnimalId(
    @Res() res,
    @Res() req,
    @Param('animalId', ParseUUIDPipe) animalId: string,
  ) {
    const { user } = req;

    const findOneTreatement = await this.treatmentsService.findOneBy({
      animalId,
      animalTypeId: user?.animalTypeId,
      organizationId: user?.organizationId,
    });
    if (!findOneTreatement)
      throw new HttpException(
        `AnimalId: ${animalId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    return reply({ res, results: findOneTreatement });
  }

  /** Delete one treatment */
  @Delete(`/:treatmentId/delete`)
  @UseGuards(UserAuthGuard)
  async deleteOne(
    @Res() res,
    @Req() req,
    @Param('treatmentId', ParseUUIDPipe) treatmentId: string,
  ) {
    const { user } = req;

    const findOneTreatement = await this.treatmentsService.findOneBy({
      treatmentId,
      animalTypeId: user?.animalTypeId,
      organizationId: user?.organizationId,
    });
    if (!findOneTreatement)
      throw new HttpException(
        `TreatmentId: ${treatmentId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    await this.activitylogsService.createOne({
      userId: user?.id,
      organizationId: user?.organizationId,
      message: `${user?.profile?.firstName} ${user?.profile?.lastName} deleted a treatment for animal ${findOneTreatement?.animal?.code} in ${findOneTreatement?.animalType?.name}`,
    });

    await this.treatmentsService.updateOne(
      { treatmentId: findOneTreatement?.id },
      { deletedAt: new Date() },
    );

    return reply({ res, results: 'Treatment deleted successfully' });
  }
}
