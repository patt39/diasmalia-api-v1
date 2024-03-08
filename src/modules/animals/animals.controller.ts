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
import * as QRCode from 'qrcode';
import { RequestPaginationDto } from '../../app/utils/pagination/request-pagination.dto';
import {
  PaginationType,
  addPagination,
} from '../../app/utils/pagination/with-pagination';
import { reply } from '../../app/utils/reply';
import { SearchQueryDto } from '../../app/utils/search-query/search-query.dto';
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
    private readonly uploadsUtil: UploadsUtil,
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
    const { status, type, gender, productionPhase } = queryAnimal;
    const { take, page, sort } = requestPaginationDto;
    const pagination: PaginationType = addPagination({ page, take, sort });

    const animals = await this.animalsService.findAll({
      type,
      gender,
      status,
      search,
      pagination,
      productionPhase,
      organizationId: user?.organizationId,
    });

    return reply({ res, results: animals });
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
      type,
      weight,
      gender,
      breedId,
      birthday,
      locationId,
      codeFather,
      codeMother,
      electronicCode,
      productionPhase,
    } = body;

    const findOneAnimal = await this.animalsService.findOneBy({
      code,
      electronicCode,
      organizationId: user?.organizationId,
    });
    if (findOneAnimal)
      throw new HttpException(
        `Animal code: ${code} already exists please change`,
        HttpStatus.NOT_FOUND,
      );

    if (findOneAnimal)
      throw new HttpException(
        `Animal electronicCode: ${electronicCode} already exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneLocation = await this.locationsService.findOneBy({
      locationId,
      organizationId: user?.organizationId,
    });
    if (!findOneLocation)
      throw new HttpException(
        `LocationId: ${locationId} doesn't exists or isn't the correct productionPhase or Type please change`,
        HttpStatus.NOT_FOUND,
      );

    if (findOneLocation.productionPhase !== productionPhase)
      throw new HttpException(
        `Animal can't be placed in this location ${findOneLocation.number} please change`,
        HttpStatus.NOT_FOUND,
      );

    if (findOneLocation.type !== type)
      throw new HttpException(
        `Animal location ${findOneLocation.type} isn't valid please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneBreed = await this.breedsService.findOneBy({
      breedId,
      organizationId: user?.organizationId,
    });
    if (!findOneBreed)
      throw new HttpException(
        `breedId: ${breedId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    if (
      gender === 'MALE' &&
      (productionPhase === 'LACTATION' ||
        productionPhase === 'WEANING' ||
        productionPhase === 'GESTATION')
    )
      throw new HttpException(
        `Male animalId: ${code} can't be in this phase please change`,
        HttpStatus.NOT_FOUND,
      );

    const animal = await this.animalsService.createOne({
      code,
      type,
      weight,
      gender,
      birthday,
      codeFather,
      codeMother,
      productionPhase,
      electronicCode,
      locationId: findOneLocation?.id,
      breedId: findOneBreed?.id,
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
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
      type,
      weight,
      gender,
      breedId,
      birthday,
      codeFather,
      codeMother,
      locationId,
      electronicCode,
      productionPhase,
    } = body;

    const { fileName } = await this.uploadsUtil.uploadOneAWS({
      file,
      userId: user?.id,
      folder: 'photos',
    });

    const findOneAnimal = await this.animalsService.findOneBy({
      animalId,
      organizationId: user?.organizationId,
    });
    if (!findOneAnimal)
      throw new HttpException(
        `AnimalId: ${animalId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneLocation = await this.locationsService.findOneBy({
      locationId,
      organizationId: user?.organizationId,
    });

    if (!findOneLocation)
      throw new HttpException(
        `LocationId: ${locationId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    if (findOneLocation.productionPhase !== productionPhase)
      throw new HttpException(
        `Animal can't be placed in this location ${findOneLocation.number} please change`,
        HttpStatus.NOT_FOUND,
      );

    if (
      findOneAnimal.gender === 'MALE' &&
      (productionPhase === 'LACTATION' ||
        productionPhase === 'WEANING' ||
        productionPhase === 'GESTATION')
    )
      throw new HttpException(
        `Male animalId: ${animalId} can't be in this phase please change`,
        HttpStatus.NOT_FOUND,
      );

    if (findOneLocation.type !== type)
      throw new HttpException(
        `Animal location ${findOneLocation.type} isn't valid please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneBreed = await this.breedsService.findOneBy({
      breedId,
      organizationId: user?.organizationId,
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
        type,
        weight,
        gender,
        birthday,
        codeFather,
        codeMother,
        photo: fileName,
        electronicCode,
        productionPhase,
        locationId: findOneLocation?.id,
        breedId: findOneBreed?.id,
        organizationId: user?.organizationId,
        userCreatedId: user?.id,
      },
    );

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
      organizationId: user?.organizationId,
    });

    if (!findOneAnimal)
      throw new HttpException(
        `Animal ${animalId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    return reply({ res, results: findOneAnimal });
  }

  /** Get animal QRCode*/
  @Get(`/view/:animalId/qrcode`)
  @UseGuards(UserAuthGuard)
  async getAnimalQRCode(
    @Res() res,
    @Req() req,
    @Param('animalId', ParseUUIDPipe) animalId: string,
  ) {
    const { user } = req;
    const url = `http://localhost:4900/api/v1/animals/view/${animalId}`;

    const qrCode = await QRCode.toDataURL(url);

    const findOneAnimal = await this.animalsService.findOneBy({
      animalId,
      organizationId: user?.organizationId,
    });
    if (!findOneAnimal)
      throw new HttpException(
        `Animal ${animalId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    return reply({ res, results: qrCode });
  }

  /** Delete one animal */
  @Delete(`/delete/:animalId`)
  @UseGuards(UserAuthGuard)
  async deleteOne(
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
        `Animal ${animalId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    await this.animalsService.updateOne(
      { animalId: findOneAnimal?.id },
      { deletedAt: new Date() },
    );

    return reply({ res, results: [HttpStatus.ACCEPTED, findOneAnimal] });
  }
}
