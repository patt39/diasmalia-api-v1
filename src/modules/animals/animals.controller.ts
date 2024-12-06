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
import axios from 'axios';
import PdfPrinter from 'pdfmake';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { Writable } from 'stream';
import { config } from '../../app/config/index';
import {
  formatDDMMYYDate,
  formatNowDateYYMMDD,
  formatWeight,
  generateNumber,
  generateUUID,
  getDayOfMonth,
} from '../../app/utils/commons';
import { RequestPaginationDto } from '../../app/utils/pagination/request-pagination.dto';
import { addPagination } from '../../app/utils/pagination/with-pagination';
import { reply } from '../../app/utils/reply';
import { SearchQueryDto } from '../../app/utils/search-query/search-query.dto';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { AssignTypesService } from '../assigne-type/assigne-type.service';
import { BreedsService } from '../breeds/breeds.service';
import { FarrowingsService } from '../farrowings/farrowings.service';
import { FatteningsService } from '../fattenings/fattening.service';
import { GestationsService } from '../gestation/gestations.service';
import { awsS3ServiceAdapter } from '../integrations/aws/aws-s3-service-adapter';
import { LocationsService } from '../locations/locations.service';
import { reportPDFAttachment } from '../users/mails/report-pdf-attachment';
import { UserAuthGuard } from '../users/middleware';
import { UsersService } from '../users/users.service';
import {
  BulkAnimalsCreateDto,
  CreateAnimalsDto,
  CreateAvesDto,
  GetAnimalsQuery,
  OffspringsIdentificationDto,
  UpdateAnimalsDto,
} from './animals.dto';
import { AnimalsService } from './animals.service';

@Controller('animals')
export class AnimalsController {
  constructor(
    private readonly breedsService: BreedsService,
    private readonly animalsService: AnimalsService,
    private readonly usersService: UsersService,
    private readonly locationsService: LocationsService,
    private readonly fatteningsService: FatteningsService,
    private readonly gestationsService: GestationsService,
    private readonly assignTypesService: AssignTypesService,
    private readonly activitylogsService: ActivityLogsService,
    private readonly farrowingsService: FarrowingsService,
  ) {}

  /** Get all animals */
  @Get(`/`)
  @UseGuards(UserAuthGuard)
  async findAll(
    @Res() res,
    @Req() req,
    @Query() requestPaginationDto: RequestPaginationDto,
    @Query() query: SearchQueryDto,
    @Query() queryAnimal: GetAnimalsQuery,
  ) {
    const { user } = req;
    const { search } = query;
    const {
      status,
      gender,
      isIsolated,
      locationId,
      animalTypeId,
      productionPhase,
    } = queryAnimal;
    const { take, page, sort, sortBy } = requestPaginationDto;
    const pagination = addPagination({ page, take, sort, sortBy });

    const animals = await this.animalsService.findAll({
      gender,
      status,
      search,
      locationId,
      isIsolated,
      pagination,
      animalTypeId,
      productionPhase,
      organizationId: user?.organizationId,
    });

    return reply({ res, results: animals });
  }

  /** Get animal statistics */
  @Get(`/:animalTypeId/statistics`)
  @UseGuards(UserAuthGuard)
  async getAnimalStatistics(
    @Res() res,
    @Req() req,
    @Query() query: GetAnimalsQuery,
    @Param('animalTypeId', ParseUUIDPipe) animalTypeId: string,
  ) {
    const { periode } = query;
    const { user } = req;

    const findOneAssignType = await this.assignTypesService.findOneBy({
      animalTypeId,
      organizationId: user?.organizationId,
    });
    if (!findOneAssignType)
      throw new HttpException(
        `AnimalType not assigned please change`,
        HttpStatus.NOT_FOUND,
      );

    const animalStatistics = await this.animalsService.getAnimalTransactions({
      periode,
      animalTypeId,
      organizationId: user.organizationId,
    });

    return reply({ res, results: animalStatistics });
  }

  /** Get sold and dead animals statistics */
  @Get(`/:animalTypeId/statistics/all`)
  @UseGuards(UserAuthGuard)
  async getAllAnimalStatistics(
    @Res() res,
    @Req() req,
    @Param('animalTypeId', ParseUUIDPipe) animalTypeId: string,
  ) {
    const { user } = req;
    const findOneAssignType = await this.assignTypesService.findOneBy({
      animalTypeId,
      organizationId: user?.organizationId,
    });
    if (!findOneAssignType)
      throw new HttpException(
        `AnimalType not assigned please change`,
        HttpStatus.NOT_FOUND,
      );

    const animalStatistics = await this.animalsService.getAllAnimalTransactions(
      { animalTypeId, organizationId: user?.organizationId },
    );
    return reply({ res, results: animalStatistics });
  }

  /** Create one aves animal */
  @Post(`/:animalTypeId/create`)
  @UseGuards(UserAuthGuard)
  async createOneAves(
    @Res() res,
    @Req() req,
    @Body() body: CreateAvesDto,
    @Param('animalTypeId', ParseUUIDPipe) animalTypeId: string,
  ) {
    const { user } = req;
    const {
      code,
      male,
      strain,
      female,
      weight,
      birthday,
      quantity,
      supplier,
      breedName,
      locationCode,
      productionPhase,
    } = body;

    const appInitials = config.datasite.name.substring(0, 1).toUpperCase();
    const orgInitials = user.organization.name.substring(0, 1).toUpperCase();
    const generatedCode = `${orgInitials}${generateNumber(4)}${appInitials}`;

    const findOneAssignType = await this.assignTypesService.findOneBy({
      animalTypeId,
      organizationId: user?.organizationId,
    });
    if (!findOneAssignType)
      throw new HttpException(
        `AnimalType not assigned please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneAnimal = await this.animalsService.findOneBy({
      code: code ? code : generatedCode,
      status: 'ACTIVE',
      organizationId: user?.organizationId,
    });
    if (findOneAnimal)
      throw new HttpException(
        `Animal code: ${findOneAnimal?.code} already exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneLocation = await this.locationsService.findOneBy({
      code: locationCode,
      organizationId: user?.organizationId,
    });
    if (!findOneLocation)
      throw new HttpException(
        `Location code: ${locationCode} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    if (findOneLocation?.status === false)
      throw new HttpException(
        `Location: ${locationCode} is OUT OF SERVICE please change`,
        HttpStatus.NOT_FOUND,
      );

    if (findOneLocation?.productionPhase !== productionPhase)
      throw new HttpException(
        `Animal can't be placed in this location code: ${findOneLocation?.code} please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneBreed = await this.breedsService.findOneBy({
      name: breedName,
      animalTypeId: findOneAnimal?.animalType?.id,
    });
    if (!findOneBreed)
      throw new HttpException(
        `breed: ${breedName} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const sumAnimals = Number(male + female);

    const animal = await this.animalsService.createOne({
      male,
      strain,
      female,
      weight,
      supplier,
      productionPhase,
      birthday: new Date(birthday),
      locationId: findOneLocation?.id,
      quantity: quantity ? quantity : sumAnimals,
      breedId: breedName ? findOneBreed?.id : null,
      code: code ? code : `${orgInitials}${generateNumber(4)}${appInitials}`,
      animalTypeId: findOneAssignType?.animalTypeId,
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
    });

    if (findOneLocation?.status === true) {
      await this.locationsService.updateOne(
        { locationId: findOneLocation?.id },
        { status: false },
      );
    }

    await this.activitylogsService.createOne({
      userId: user?.id,
      organizationId: user?.organizationId,
      message: `${user?.profile?.firstName} ${user?.profile?.lastName} created a band with code ${animal?.code} in ${findOneAssignType?.animalType?.name}`,
    });

    return reply({
      res,
      results: {
        status: HttpStatus.CREATED,
        data: animal,
        message: `Animal Created Successfully`,
      },
    });
  }

  /** Create one animal */
  @Post(`/create`)
  @UseGuards(UserAuthGuard)
  async createOne(@Res() res, @Req() req, @Body() body: CreateAnimalsDto) {
    const { user } = req;
    const {
      code,
      weight,
      gender,
      birthday,
      codeMother,
      codeFather,
      breedName,
      locationCode,
      productionPhase,
    } = body;

    const findOneLocation = await this.locationsService.findOneBy({
      code: locationCode,
      organizationId: user?.organizationId,
    });
    if (!findOneLocation)
      throw new HttpException(
        `Location: ${locationCode} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneAnimal = await this.animalsService.findOneBy({
      code: code,
      organizationId: user?.organizationId,
      animalTypeId: findOneLocation?.animalTypeId,
    });
    if (code == findOneAnimal?.code)
      throw new HttpException(
        `Animal code: ${findOneAnimal?.code} already exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneBreed = await this.breedsService.findOneBy({
      name: breedName,
      animalTypeId: findOneAnimal?.animalType?.id,
    });
    if (!findOneBreed)
      throw new HttpException(
        `breed: ${breedName} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    if (
      findOneLocation?.productionPhase !== productionPhase &&
      findOneLocation?.productionPhase !== 'GROWTH'
    )
      throw new HttpException(
        `Animal can't be placed in this location code: ${findOneLocation?.code} please change`,
        HttpStatus.NOT_FOUND,
      );

    if (findOneLocation?.productionPhase == 'GESTATION' && gender == 'MALE')
      throw new HttpException(
        `Animal can't be placed in this location code: ${findOneLocation?.code} please change`,
        HttpStatus.NOT_FOUND,
      );

    const appInitials = config.datasite.name.substring(0, 1).toUpperCase();
    const orgInitials = user.organization.name.substring(0, 1).toUpperCase();

    const animal = await this.animalsService.createOne({
      weight,
      gender,
      codeFather,
      codeMother,
      productionPhase,
      breedId: findOneBreed?.id,
      birthday: new Date(birthday),
      locationId: findOneLocation?.id,
      code: code
        ? code.toUpperCase()
        : `${orgInitials}${generateNumber(4)}${appInitials}`,
      animalTypeId: findOneBreed?.animalTypeId,
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
    });

    if (productionPhase === 'FATTENING') {
      await this.fatteningsService.createOne({
        animalId: animal?.id,
        actualWeight: animal?.weight,
        initialWeight: animal?.weight,
        animalTypeId: animal?.animalTypeId,
        organizationId: user?.organizationId,
        userCreatedId: user?.id,
      });
    }

    if (productionPhase === 'GESTATION' && gender === 'FEMALE') {
      await this.gestationsService.createOne({
        method: 'OBSERVATION',
        animalId: animal?.id,
        animalTypeId: animal?.animalTypeId,
        organizationId: user?.organizationId,
        userCreatedId: user?.id,
      });
    }

    await this.activitylogsService.createOne({
      userId: user?.id,
      message: `${user?.profile?.firstName} ${user?.profile?.lastName} created an animal with code ${animal?.code} in ${findOneLocation?.animalType?.name}`,
      organizationId: user?.organizationId,
    });

    return reply({
      res,
      results: {
        status: HttpStatus.CREATED,
        data: animal,
        message: `Animal Created Successfully`,
      },
    });
  }

  /** Create bulk animals */
  @Post(`/create/bulk`)
  @UseGuards(UserAuthGuard)
  async createMany(@Res() res, @Req() req, @Body() body: BulkAnimalsCreateDto) {
    const { user } = req;
    const {
      number,
      weight,
      gender,
      birthday,
      codeMother,
      codeFather,
      breedName,
      locationCode,
      productionPhase,
    } = body;

    const findOneLocation = await this.locationsService.findOneBy({
      code: locationCode,
      organizationId: user?.organizationId,
    });
    if (!findOneLocation)
      throw new HttpException(
        `Location: ${locationCode} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneBreed = await this.breedsService.findOneBy({
      name: breedName,
    });
    if (!findOneBreed)
      throw new HttpException(
        `breed: ${breedName} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    if (
      productionPhase !== 'FATTENING' &&
      findOneLocation?.productionPhase == 'FATTENING'
    )
      throw new HttpException(
        `Animal can't be placed in this location code: ${findOneLocation?.code} please change`,
        HttpStatus.NOT_FOUND,
      );

    if (
      productionPhase === 'REPRODUCTION' &&
      ['GESTATTION', 'GROWTH'].includes(findOneLocation?.productionPhase)
    )
      throw new HttpException(
        `Male animal: ${findOneLocation?.code} can't be placed in GESTATION or GROWTH phase please change`,
        HttpStatus.NOT_FOUND,
      );

    const appInitials = config.datasite.name.substring(0, 1).toUpperCase();
    const orgInitials = user?.organization.name.substring(0, 1).toUpperCase();
    const newAnimalArray: any = [];

    for (let i = 0; i < number; i++) {
      const animal = await this.animalsService.createOne({
        weight,
        gender,
        codeFather,
        codeMother,
        productionPhase,
        breedId: findOneBreed?.id,
        birthday: new Date(birthday),
        locationId: findOneLocation?.id,
        code: `${orgInitials}${generateNumber(4)}${appInitials}`,
        animalTypeId: findOneBreed?.animalTypeId,
        organizationId: user?.organizationId,
        userCreatedId: user?.id,
      });

      newAnimalArray.push(animal);

      if (productionPhase === 'FATTENING') {
        await this.fatteningsService.createOne({
          animalId: animal?.id,
          actualWeight: animal?.weight,
          initialWeight: animal?.weight,
          animalTypeId: animal?.animalTypeId,
          organizationId: user?.organizationId,
          userCreatedId: user?.id,
        });
      }

      if (productionPhase === 'GESTATION' && gender === 'FEMALE') {
        await this.gestationsService.createOne({
          method: 'OBSERVATION',
          animalId: animal?.id,
          animalTypeId: animal?.animalTypeId,
          organizationId: user?.organizationId,
          userCreatedId: user?.id,
        });
      }

      await this.activitylogsService.createOne({
        userId: user?.id,
        message: `${user?.profile?.firstName} ${user?.profile?.lastName} created an animal with code ${animal?.code} in ${findOneLocation?.animalType?.name}`,
        organizationId: user?.organizationId,
      });
    }

    return reply({
      res,
      results: {
        status: HttpStatus.CREATED,
        message: `Animals Created Successfully`,
      },
    });
  }

  /** Offsprings identification */
  @Post(`/identification`)
  @UseGuards(UserAuthGuard)
  async offspringsIdentification(
    @Res() res,
    @Req() req,
    @Body() body: OffspringsIdentificationDto,
  ) {
    const { user } = req;
    const {
      males,
      females,
      weight,
      breedName,
      codeFather,
      codeMother,
      birthday,
    } = body;

    const sumAnimals = Number(males + females);

    const findOneBreed = await this.breedsService.findOneBy({
      name: breedName,
    });
    if (!findOneBreed)
      throw new HttpException(
        `breed: ${breedName} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneAnimal = await this.animalsService.findOneBy({
      code: codeMother,
      organizationId: user?.organizationId,
      //animalTypeId: findOneBreed?.animalTypeId,
    });
    if (!findOneAnimal)
      throw new HttpException(
        `Mother code: ${findOneAnimal?.codeMother} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const findLatestFarrowing = await this.farrowingsService.findOneBy({
      animalId: findOneAnimal?.id,
      organizationId: user?.organizationId,
      animalTypeId: findOneBreed?.animalTypeId,
    });
    if (!findLatestFarrowing)
      throw new HttpException(
        `${findLatestFarrowing?.id} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    if (findLatestFarrowing?.litter !== sumAnimals)
      throw new HttpException(
        `Impossible to create farrowing litter: ${findLatestFarrowing?.litter} please change`,
        HttpStatus.NOT_FOUND,
      );

    const appInitials = config.datasite.name.substring(0, 1).toUpperCase();
    const orgInitials = user.organization.name.substring(0, 1).toUpperCase();
    const animalArray: any = [];

    for (let i = 0; i < males; i++) {
      const animal = await this.animalsService.createOne({
        weight,
        codeFather,
        codeMother,
        gender: 'MALE',
        productionPhase: 'GROWTH',
        breedId: findOneBreed?.id,
        birthday: new Date(birthday),
        locationId: findOneAnimal?.locationId,
        code: `${orgInitials}${generateNumber(4)}${appInitials}`,
        animalTypeId: findOneBreed?.animalTypeId,
        organizationId: user?.organizationId,
        userCreatedId: user?.id,
      });

      animalArray.push(animal);

      await this.activitylogsService.createOne({
        userId: user?.id,
        message: `${user?.profile?.firstName} ${user?.profile?.lastName} created an animal with code ${animal?.code} in ${findOneAnimal?.animalType?.name}`,
        organizationId: user?.organizationId,
      });
    }

    for (let i = 0; i < females; i++) {
      const animal = await this.animalsService.createOne({
        weight,
        codeFather,
        codeMother,
        gender: 'FEMALE',
        productionPhase: 'GROWTH',
        breedId: findOneBreed?.id,
        birthday: new Date(birthday),
        locationId: findOneAnimal?.locationId,
        code: `${orgInitials}${generateNumber(4)}${appInitials}`,
        animalTypeId: findOneBreed?.animalTypeId,
        organizationId: user?.organizationId,
        userCreatedId: user?.id,
      });

      animalArray.push(animal);

      await this.activitylogsService.createOne({
        userId: user?.id,
        message: `${user?.profile?.firstName} ${user?.profile?.lastName} created an animal with code ${animal?.code} in ${findOneAnimal?.animalType?.name}`,
        organizationId: user?.organizationId,
      });
    }

    return reply({ res, results: 'Animals created successfully' });
  }

  /** Update one animal */
  @Put(`/:animalId/edit`)
  @UseGuards(UserAuthGuard)
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: UpdateAnimalsDto,
    @Param('animalId', ParseUUIDPipe) animalId: string,
  ) {
    const { user } = req;
    const {
      code,
      male,
      strain,
      female,
      weight,
      gender,
      supplier,
      birthday,
      quantity,
      breedName,
      codeFather,
      codeMother,
      isCastrated,
      locationCode,
      productionPhase,
    } = body;

    const findOneAnimal = await this.animalsService.findOneBy({
      animalId,
      organizationId: user?.organizationId,
    });
    if (!findOneAnimal)
      throw new HttpException(
        `AnimalId: ${animalId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    if (
      gender === 'MALE' &&
      (productionPhase === 'LACTATION' || productionPhase === 'GESTATION')
    )
      throw new HttpException(
        `Male code: ${code} can't be in this phase please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneLocation = await this.locationsService.findOneBy({
      code: locationCode,
      organizationId: user?.organizationId,
      animalTypeId: findOneAnimal?.animalTypeId,
    });
    if (!findOneLocation)
      throw new HttpException(
        `LocationId: ${code} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneBreed = await this.breedsService.findOneBy({
      name: breedName,
    });
    if (!findOneBreed)
      throw new HttpException(
        `breed ${breedName} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    if (
      productionPhase === 'GROWTH' &&
      findOneAnimal?._count?.eggHavestings !== 0
    )
      throw new HttpException(
        `Band: ${findOneAnimal?.code} can't be placed in GROWTH phase please change`,
        HttpStatus.NOT_FOUND,
      );

    const animal = await this.animalsService.updateOne(
      { animalId: findOneAnimal?.id },
      {
        male,
        strain,
        female,
        weight,
        gender,
        supplier,
        quantity,
        isCastrated,
        productionPhase,
        code: code.toUpperCase(),
        birthday: new Date(birthday),
        codeMother: codeMother,
        codeFather: codeFather,
        breedId: breedName ? findOneBreed?.id : breedName,
        locationId: locationCode
          ? findOneLocation?.id
          : findOneAnimal?.locationId,
        organizationId: user?.organizationId,
        userCreatedId: user?.id,
      },
    );

    await this.activitylogsService.createOne({
      userId: user?.id,
      organizationId: user?.organizationId,
      message: `${user?.profile?.firstName} ${user?.profile?.lastName} updated an animal with code ${animal?.code} in ${findOneAnimal?.animalType?.name}`,
    });

    return reply({
      res,
      results: {
        data: animal,
        status: HttpStatus.CREATED,
        message: `Animal Updated Successfully`,
      },
    });
  }

  /** Get one animal */
  @Get(`/:animalId/view`)
  @UseGuards(UserAuthGuard)
  async getOneByIdAnimal(
    @Res() res,
    @Req() req,
    @Param('animalId', ParseUUIDPipe) animalId: string,
  ) {
    const { user } = req;
    const findOneAnimal = await this.animalsService.findOneAnimalDetails({
      animalId,
      organizationId: user?.organizationId,
    });
    if (!findOneAnimal)
      throw new HttpException(
        `Animal ${animalId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    return reply({ res, results: findOneAnimal });
  }

  /** Change production status */
  @Put(`/:animalId/change-status`)
  @UseGuards(UserAuthGuard)
  async changeStatus(
    @Res() res,
    @Req() req,
    @Param('animalId', ParseUUIDPipe) animalId: string,
  ) {
    const { user } = req;

    const findOneAnimal = await this.animalsService.findOneAnimalDetails({
      animalId,
      organizationId: user?.organizationId,
    });
    if (!findOneAnimal)
      throw new HttpException(
        `Animal ${animalId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneUser = await this.usersService.findOneBy({
      organizationId: user?.organizationId,
    });
    if (!findOneUser)
      throw new HttpException(`User not authenticated`, HttpStatus.NOT_FOUND);

    const findUniqueUser = await this.usersService.findMe({
      userId: user?.id,
    });
    if (!findUniqueUser)
      throw new HttpException(`User not authenticated`, HttpStatus.NOT_FOUND);

    const feedIndex = Number(
      findOneAnimal?.feedingsCount / findOneAnimal?.weight,
    );

    const duration = Number(
      getDayOfMonth(findOneAnimal?.birthday) - new Date().getDate(),
    );

    const deathPercentage =
      Number(findOneAnimal?.deathsCount / findOneAnimal?.quantity) * 100;

    const revenu =
      Number(
        findOneAnimal?.chickenSaleAmount +
          findOneAnimal?.chickSaleAmount +
          findOneAnimal?.eggSaleAmount,
      ) - Number(String(findOneAnimal?.totalExpenses).slice(1));

    await this.animalsService.updateOne(
      { animalId: findOneAnimal?.id },
      { status: 'STOPPED' },
    );

    const fonts = {
      Helvetica: {
        normal: 'Helvetica',
        bold: 'Helvetica-Bold',
        italics: 'Helvetica-Oblique',
        bolditalics: 'Helvetica-BoldOblique',
      },
    };

    const printer = new PdfPrinter(fonts);
    const docDefinition = {
      footer: function () {
        return {
          text: `Generated by ${config.datasite.name} on ${formatDDMMYYDate(new Date())}`,
          alignment: 'right',
          style: 'normalText',
          margin: [10, 10, 10, 10],
        };
      },

      content: [
        {
          text: `Rapport de fin de production`,
          alignment: 'center',
          bold: true,
          style: { fontSize: 20 },
          margin: [0, 0, 0, 10],
        },
        '\n',
        {
          text: `Lancé le: ${formatDDMMYYDate(findOneAnimal?.birthday)}`,
          alignment: 'center',
          style: { fontSize: 12 },
          margin: [0, 0, 0, 10],
        },
        {
          text: `Fournisseur: ${findOneAnimal?.supplier}`,
          alignment: 'center',
          style: { fontSize: 12 },
          margin: [0, 0, 0, 10],
        },
        {
          text: `Souche: ${findOneAnimal?.strain}`,
          alignment: 'center',
          style: { fontSize: 12 },
          margin: [0, 0, 0, 10],
        },
        {
          text: `Code de la bande: ${findOneAnimal?.code}, Type: ${findOneAnimal?.animalType?.name}`,
          alignment: 'center',
          style: { fontSize: 12 },
          margin: [0, 0, 0, 10],
        },
        '\n',
        {
          text: `Effectif initial: ${findOneAnimal?.quantity}`,
          style: { fontSize: 12 },
          margin: [0, 0, 0, 10],
        },
        '\n',
        {
          text: `Aliment consommé: ${formatWeight(findOneAnimal?.feedingsCount)}`,
          style: { fontSize: 12 },
          margin: [0, 0, 0, 10],
        },
        '\n',
        {
          text: `Indice de consommation: ${feedIndex.toFixed(1)}`,
          style: { fontSize: 12 },
          margin: [0, 0, 0, 10],
        },
        '\n',
        {
          text: `Poids à la vente: ${formatWeight(findOneAnimal?.weight)}`,
          style: { fontSize: 12 },
          margin: [0, 0, 0, 10],
        },
        '\n',
        {
          text: `Poids à la vente: ${formatWeight(findOneAnimal?.weight)}`,
          style: { fontSize: 12 },
          margin: [0, 0, 0, 10],
        },
        '\n',
        {
          text: `Durée de la production: ${duration} jours`,
          style: { fontSize: 12 },
          margin: [0, 0, 0, 10],
        },
        '\n',
        {
          text: `Morts: ${findOneAnimal?.deathsCount}`,
          style: { fontSize: 12 },
          margin: [0, 0, 0, 10],
        },
        '\n',
        {
          text: `Pourcentage de morts: ${deathPercentage.toFixed(1)} %`,
          style: { fontSize: 12 },
          margin: [0, 0, 0, 10],
        },
        '\n',
        {
          text: `Morts: ${findOneAnimal?.deathsCount}`,
          style: { fontSize: 12 },
          margin: [0, 0, 0, 10],
        },
        '\n',
        {
          text: `Oeufs ramassés: ${findOneAnimal?.totalEggsHarvested}`,
          style: { fontSize: 12 },
          margin: [0, 0, 0, 10],
        },
        '\n',
        {
          table: {
            body: [
              ['Poulets vendus', 'Montant'],
              [
                findOneAnimal?.chickenSaleCount,
                `${findOneAnimal?.chickenSaleAmount.toLocaleString('en-US')}${findUniqueUser?.profile?.currency?.symbol}`,
              ],
            ],
          },
        },
        '\n',
        {
          table: {
            body: [
              ['Oeufs vendus', 'Montant'],
              [
                findOneAnimal?.eggSaleCount,
                `${findOneAnimal?.eggSaleAmount.toLocaleString('en-US')}${findUniqueUser?.profile?.currency?.symbol}`,
              ],
            ],
          },
        },
        '\n',
        {
          table: {
            body: [
              ['Poussins vendus', 'Montant'],
              [
                findOneAnimal?.chickSaleCount,
                `${findOneAnimal?.chickSaleAmount.toLocaleString('en-US')}${findUniqueUser?.profile?.currency?.symbol}`,
              ],
            ],
          },
        },
        '\n',
        {
          text: `Dépenses total: ${Number(String(findOneAnimal?.totalExpenses).slice(1)).toLocaleString('en-US')}${findUniqueUser?.profile?.currency?.symbol}`,
          bold: true,
          alignment: 'right',
          style: { fontSize: 12 },
          margin: [0, 0, 0, 10],
        },
        '\n',
        {
          text: `Revenu net: ${revenu.toLocaleString('en-US')} ${findUniqueUser?.profile?.currency?.symbol}`,
          bold: true,
          alignment: 'right',
          style: { fontSize: 12 },
          margin: [0, 0, 0, 10],
        },
      ],
      defaultStyle: {
        font: 'Helvetica',
      },
    } as TDocumentDefinitions;

    const nameFile = `${formatNowDateYYMMDD(new Date())}-${generateUUID()}`;
    const fileName = `${nameFile}.pdf`;
    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    pdfDoc.compress = true;
    const chunks = [] as any;
    await new Promise((resolve, reject) => {
      const stream = new Writable({
        write: (chunk, _, next) => {
          chunks.push(chunk);
          next();
        },
      });
      stream.once('error', (err) => reject(err));
      stream.once('close', () => resolve('ok'));
      pdfDoc.pipe(stream);
      pdfDoc.end();
    });

    const awsPdf = await awsS3ServiceAdapter({
      fileName: fileName,
      mimeType: 'application/pdf',
      folder: 'sales-pdf',
      file: Buffer.concat(chunks),
    });

    await this.animalsService.updateOne(
      { animalId: findOneAnimal?.id },
      { report: awsPdf?.Location },
    );
    await reportPDFAttachment({
      animal: findOneAnimal,
      email: findOneUser?.email,
      filename: fileName,
      content: Buffer.concat(chunks),
    });

    return reply({ res, results: 'Status changed successfully' });
  }

  /** Pdf report download */
  @Get(`/:animalId/download`)
  async getOneUploadedPDF(
    @Res() res,
    @Req() req,
    @Param('animalId', ParseUUIDPipe) animalId: string,
  ) {
    const { user } = req;

    const findOneAnimal = await this.animalsService.findOneBy({
      animalId,
      organizationId: user?.organizationId,
    });
    if (!findOneAnimal)
      throw new HttpException(
        `AnimalId: ${animalId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    try {
      const pdfResponse = await axios.get(findOneAnimal?.report, {
        responseType: 'arraybuffer', // Ensures the PDF is handled as a binary
      });
      const fileName = `document_${findOneAnimal?.id}.pdf`;
      res.status(200);
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${fileName}"`,
      );
      res.set('Cross-Origin-Resource-Policy', 'cross-origin');
      res.send(pdfResponse.data);
      await this.activitylogsService.createOne({
        userId: user?.id,
        organizationId: user?.organizationId,
        message: `${user?.profile?.firstName} ${user?.profile?.lastName} downloaded a pdf report`,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Error during file recovering.');
    }
  }

  /** Get one animal by animalType */
  @Get(`/:animalTypeId/view/animal`)
  @UseGuards(UserAuthGuard)
  async getOneByAnimalTypeId(
    @Res() res,
    @Req() req,
    @Param('animalTypeId', ParseUUIDPipe) animalTypeId: string,
  ) {
    const { user } = req;
    const findOneAnimal = await this.animalsService.findOneAnimalDetails({
      animalTypeId,
      organizationId: user?.organizationId,
    });
    if (!findOneAnimal)
      throw new HttpException(
        `${animalTypeId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    return reply({ res, results: findOneAnimal });
  }

  /** Delete one animal */
  @Delete(`/:animalId/delete`)
  @UseGuards(UserAuthGuard)
  async deleteOne(
    @Res() res,
    @Req() req,
    @Param('animalId', ParseUUIDPipe) animalId: string,
  ) {
    const { user } = req;

    const findOneAnimal = await this.animalsService.findDeleteOne({
      animalId,
      organizationId: user?.organizationId,
    });
    if (!findOneAnimal)
      throw new HttpException(
        `AnimalId: ${animalId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    await this.animalsService.deleteOne({ animalId: findOneAnimal?.id });

    if (
      !['Porciculture', 'Bovins', 'Cuniculture', 'Ovins', 'Caprins'].includes(
        findOneAnimal?.animalType?.name,
      )
    ) {
      await this.locationsService.updateOne(
        { locationId: findOneAnimal?.locationId },
        { status: true },
      );
    }

    await this.activitylogsService.createOne({
      userId: user?.id,
      organizationId: user?.organizationId,
      message: `${user?.profile?.firstName} ${user?.profile?.lastName} deleted an animal with code ${findOneAnimal?.code} in ${findOneAnimal?.animalType?.name}`,
    });

    return reply({ res, results: { message: 'Animal deleted successfully' } });
  }

  /** Delete one animal */
  @Put(`/:animalId/archive/aves`)
  @UseGuards(UserAuthGuard)
  async archive(
    @Res() res,
    @Req() req,
    @Param('animalId', ParseUUIDPipe) animalId: string,
  ) {
    const { user } = req;

    const findOneAnimal = await this.animalsService.findOneBy({
      animalId,
      organizationId: user?.organizationId,
    });
    if (!findOneAnimal)
      throw new HttpException(
        `AnimalId: ${animalId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    await this.animalsService.updateOne(
      { animalId: findOneAnimal?.id },
      { status: 'ARCHIVED' },
    );

    await this.animalsService.updateOne(
      { animalId: findOneAnimal?.id },
      { deletedAt: new Date() },
    );

    await this.activitylogsService.createOne({
      userId: user?.id,
      organizationId: user?.organizationId,
      message: `${user?.profile?.firstName} ${user?.profile?.lastName} archived ${findOneAnimal?.code} in ${findOneAnimal?.animalType?.name}`,
    });

    return reply({ res, results: { message: 'Animal archived successfully' } });
  }
}
