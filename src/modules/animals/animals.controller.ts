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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { config } from '../../app/config/index';
import { generateNumber } from '../../app/utils/commons';
import { RequestPaginationDto } from '../../app/utils/pagination/request-pagination.dto';
import { addPagination } from '../../app/utils/pagination/with-pagination';
import { reply } from '../../app/utils/reply';
import { SearchQueryDto } from '../../app/utils/search-query/search-query.dto';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { AssignTypesService } from '../assigne-type/assigne-type.service';
import { BreedsService } from '../breeds/breeds.service';
import { UploadsUtil } from '../integrations/integration.utils';
import { LocationsService } from '../locations/locations.service';
import { UserAuthGuard } from '../users/middleware';
import { CreateOrUpdateAnimalsDto, GetAnimalsQuery } from './animals.dto';
import { AnimalsService } from './animals.service';

@Controller('animals')
export class AnimalsController {
  constructor(
    private readonly animalsService: AnimalsService,
    private readonly locationsService: LocationsService,
    private readonly breedsService: BreedsService,
    private readonly assignTypesService: AssignTypesService,
    private readonly uploadsUtil: UploadsUtil,
    private readonly activitylogsService: ActivityLogsService,
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
    const { status, animalTypeId, gender, productionPhase } = queryAnimal;
    const { take, page, sort, sortBy } = requestPaginationDto;
    const pagination = addPagination({ page, take, sort, sortBy });

    const animals = await this.animalsService.findAll({
      gender,
      status,
      search,
      pagination,
      animalTypeId,
      productionPhase,
      organizationId: user?.organizationId,
    });

    return reply({ res, results: animals });
  }

  /** Get animal statistics */
  @Get(`/statistics`)
  @UseGuards(UserAuthGuard)
  async getAnimalStatistics(@Res() res) {
    const animalsCount = await this.animalsService.getAnimalTransactions();

    return reply({ res, results: animalsCount });
  }

  /** Post one animal */
  @Post(`/create`)
  @UseGuards(UserAuthGuard)
  async createOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateAnimalsDto,
  ) {
    const { user } = req;
    const {
      code,
      weight,
      gender,
      breedId,
      birthday,
      quantity,
      codeMother,
      codeFather,
      locationId,
      animalTypeId,
      electronicCode,
      productionPhase,
    } = body;

    const findOneAnimal = await this.animalsService.findOneByCode({
      code,
      electronicCode,
      organizationId: user.organizationId,
    });
    if (findOneAnimal)
      throw new HttpException(
        `Animal code: ${findOneAnimal?.code} already exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneAssignType = await this.assignTypesService.findOneBy({
      animalTypeId,
      organizationId: user.organizationId,
    });
    if (!findOneAssignType)
      throw new HttpException(
        `AnimalType not assigned please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneLocation = await this.locationsService.findOneBy({
      locationId,
      organizationId: user.organizationId,
      animalTypeId: findOneAssignType.animalTypeId,
    });
    if (!findOneLocation)
      throw new HttpException(
        `LocationId: ${locationId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    if (findOneLocation?.productionPhase !== productionPhase)
      throw new HttpException(
        `Animal can't be placed in this location code: ${findOneLocation?.code} please change`,
        HttpStatus.NOT_FOUND,
      );

    if (findOneLocation?.animalTypeId !== findOneAssignType?.animalTypeId)
      throw new HttpException(
        `Animal can't be created in this type`,
        HttpStatus.NOT_FOUND,
      );

    const findOneBreed = await this.breedsService.findOneBy({
      breedId,
    });
    if (!findOneBreed)
      throw new HttpException(
        `breedId: ${breedId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    if (
      gender === 'MALE' &&
      (productionPhase === 'LACTATION' || productionPhase === 'GESTATION')
    )
      throw new HttpException(
        `Male animalId: ${code} can't be in this phase please change`,
        HttpStatus.NOT_FOUND,
      );

    const appInitials = config.datasite.name.substring(0, 1).toUpperCase();
    const orgInitials = user.organization.name.substring(0, 1).toUpperCase();

    const animal = await this.animalsService.createOne({
      weight,
      gender,
      quantity,
      birthday,
      codeFather,
      codeMother,
      electronicCode,
      productionPhase,
      breedId: findOneBreed.id,
      locationId: findOneLocation.id,
      code: code ? code : `${orgInitials}${generateNumber(4)}${appInitials}`,
      animalTypeId: findOneAssignType.animalTypeId,
      organizationId: user.organizationId,
      userCreatedId: user.id,
    });

    await this.activitylogsService.createOne({
      userId: user.id,
      message: `${user.profile?.firstName} ${user.profile?.lastName} created an animal with code ${animal?.code} in ${findOneAssignType.animalType.name}`,
      organizationId: user.organizationId,
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

  /** Update one animal */
  @Put(`/:animalId/edit`)
  @UseGuards(UserAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateAnimalsDto,
    @Param('animalId', ParseUUIDPipe) animalId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const { user } = req;
    const {
      code,
      weight,
      gender,
      breedId,
      birthday,
      codeFather,
      codeMother,
      locationId,
      animalTypeId,
      electronicCode,
    } = body;

    const { fileName } = await this.uploadsUtil.uploadOneAWS({
      file,
      userId: user.id,
      folder: 'photos',
    });

    const findOneAnimal = await this.animalsService.findOneBy({
      animalId,
      organizationId: user.organizationId,
    });
    if (!findOneAnimal)
      throw new HttpException(
        `AnimalId: ${animalId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneLocation = await this.locationsService.findOneBy({
      locationId,
      organizationId: user.organizationId,
    });
    if (!findOneLocation)
      throw new HttpException(
        `LocationId: ${locationId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneAssignType = await this.assignTypesService.findOneBy({
      animalTypeId,
      organizationId: user.organizationId,
    });
    if (!findOneAssignType)
      throw new HttpException(
        `AnimalType not assigned please change`,
        HttpStatus.NOT_FOUND,
      );

    if (findOneLocation?.animalTypeId !== findOneAssignType?.animalTypeId)
      throw new HttpException(
        `Animal can't be created in this type`,
        HttpStatus.NOT_FOUND,
      );

    const findOneBreed = await this.breedsService.findOneBy({
      breedId,
    });
    if (!findOneBreed)
      throw new HttpException(
        `breedId: ${breedId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const animal = await this.animalsService.updateOne(
      { animalId: findOneAnimal?.id },
      {
        code,
        weight,
        gender,
        birthday,
        codeFather,
        codeMother,
        electronicCode,
        photo: fileName,
        breedId: findOneBreed.id,
        locationId: findOneLocation.id,
        organizationId: user.organizationId,
        userCreatedId: user.id,
      },
    );

    await this.activitylogsService.createOne({
      userId: user.id,
      organizationId: user.organizationId,
      message: `${user.profile?.firstName} ${user.profile?.lastName} updated an animal with code ${animal?.code} in ${findOneAssignType.animalType.name}`,
    });

    return reply({
      res,
      results: {
        status: HttpStatus.CREATED,
        data: animal,
        message: `Animal Updated Successfully`,
      },
    });
  }

  /** Get one animal */
  @Get(`/view/:animalId`)
  @UseGuards(UserAuthGuard)
  async getOneByIdAnimal(
    @Res() res,
    @Req() req,
    @Param('animalId', ParseUUIDPipe) animalId: string,
  ) {
    const { user } = req;
    const findOneAnimal = await this.animalsService.findOneBy({
      animalId,
      organizationId: user.organizationId,
    });
    if (!findOneAnimal)
      throw new HttpException(
        `Animal ${animalId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    return reply({ res, results: findOneAnimal });
  }

  /** Download animal template */
  @Get(`/download/template`)
  @UseGuards(UserAuthGuard)
  async getDownloadTemplate(@Res() res) {
    try {
      await this.animalsService.downloadExcelTemplate(res);
      res.setHeader(
        'Content-Disposition',
        'attachment; filename= ' + 'BulkImportTemplate.xlsx',
      );

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocuments.spreadsheetml.sheet',
      );
    } catch (error) {
      console.error(error);
      res.status(500).send('Error during download.');
    }
  }

  @Post(`/upload/data`)
  @UseInterceptors(FileInterceptor('file'))
  async uploadExcelFile(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<void> {
    await this.animalsService.uploadDataFromExcel(file.path);
    //data.pipe(createReadStream(file.path));
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

    const findOneAnimal = await this.animalsService.findOneBy({
      animalId,
      organizationId: user.organizationId,
    });
    if (!findOneAnimal)
      throw new HttpException(
        `AnimalId: ${animalId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    await this.animalsService.updateOne(
      { animalId: findOneAnimal.id },
      { deletedAt: new Date() },
    );

    await this.activitylogsService.createOne({
      userId: user.id,
      organizationId: user.organizationId,
      message: `${user.profile?.firstName} ${user.profile?.lastName} deleted an animal with code ${findOneAnimal?.code} in ${findOneAnimal.animalType.name}`,
    });

    return reply({ res, results: { message: 'Animal deleted successfully' } });
  }
}
