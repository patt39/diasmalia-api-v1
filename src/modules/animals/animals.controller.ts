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
import { config } from '../../app/config/index';
import { generateNumber } from '../../app/utils/commons';
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
import { LocationsService } from '../locations/locations.service';
import { UserAuthGuard } from '../users/middleware';
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
      code: code.toLowerCase(),
      organizationId: user?.organizationId,
      animalTypeId: findOneLocation?.animalTypeId,
    });
    if (code.toLowerCase() == findOneAnimal?.code)
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
        ? code.toLowerCase()
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
      animalTypeId: findOneAnimal?.animalTypeId,
      organizationId: user?.organizationId,
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
        code,
        male,
        strain,
        female,
        weight,
        gender,
        supplier,
        quantity,
        codeFather,
        codeMother,
        isCastrated,
        productionPhase,
        birthday: new Date(birthday),
        breedId: breedName ? findOneBreed?.id : breedName,
        locationId: locationCode
          ? findOneLocation?.id
          : findOneAnimal?.locationId,
        organizationId: user?.organizationId,
        userCreatedId: user?.id,
      },
    );

    await this.locationsService.updateOne(
      { locationId: animal?.locationId },
      { productionPhase: animal?.productionPhase },
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
