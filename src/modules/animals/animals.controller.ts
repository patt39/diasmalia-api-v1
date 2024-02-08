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
import { RequestPaginationDto } from '../../app/utils/pagination/request-pagination.dto';
import {
  PaginationType,
  addPagination,
} from '../../app/utils/pagination/with-pagination';
import { reply } from '../../app/utils/reply';
import { SearchQueryDto } from '../../app/utils/search-query/search-query.dto';
import { BreedsService } from '../breeds/breeds.service';
import { LocationsService } from '../locations/locations.service';
import { JwtAuthGuard } from '../users/middleware';
import { CreateOrUpdateAnimalsDto } from './animals.dto';
import { AnimalsService } from './animals.service';

@Controller('animals')
export class AnimalsController {
  constructor(
    private readonly animalsService: AnimalsService,
    private readonly locationsService: LocationsService,
    private readonly breedsService: BreedsService,
  ) {}

  /** Get all Animals */
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

    const animals = await this.animalsService.findAll({
      search,
      pagination,
      organizationId: user?.organizationId,
    });

    return reply({ res, results: animals });
  }

  /** Post one Animal */
  @Post(`/`)
  @UseGuards(JwtAuthGuard)
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
      status,
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
      type,
      locationId,
      productionPhase,
      organizationId: user?.organizationId,
    });

    if (!findOneLocation)
      throw new HttpException(
        `Location ${locationId} doesn't exists or isn't the correct productionPhase or Type please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneBreed = await this.breedsService.findOneBy({
      breedId,
      organizationId: user.organizationId,
    });
    if (!findOneBreed)
      throw new HttpException(
        `breedId ${breedId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const animal = await this.animalsService.createOne({
      code,
      type,
      status,
      weight,
      gender,
      birthday,
      codeFather,
      codeMother,
      productionPhase,
      electronicCode,
      locationId: findOneLocation.id,
      breedId: findOneBreed.id,
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
    });

    return reply({ res, results: animal });
  }

  /** Update one Animals */
  @Put(`/:animalId`)
  @UseGuards(JwtAuthGuard)
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateAnimalsDto,
    @Param('animalId', ParseUUIDPipe) animalId: string,
  ) {
    const { user } = req;
    const {
      code,
      type,
      weight,
      gender,
      status,
      breedId,
      birthday,
      codeFather,
      codeMother,
      locationId,
      electronicCode,
      productionPhase,
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

    const findOneLocation = await this.locationsService.findOneBy({
      locationId,
      organizationId: user?.organizationId,
    });

    if (!findOneLocation)
      throw new HttpException(
        `Location ${locationId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneBreed = await this.breedsService.findOneBy({
      breedId,
      organizationId: user.organizationId,
    });
    if (!findOneBreed)
      throw new HttpException(
        `breedId ${breedId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const animal = await this.animalsService.updateOne(
      { animalId: findOneAnimal?.id },
      {
        code,
        type,
        status,
        weight,
        gender,
        birthday,
        codeFather,
        codeMother,
        productionPhase,
        electronicCode,
        locationId: findOneLocation.id,
        breedId: findOneBreed.id,
        organizationId: user?.organizationId,
        userCreatedId: user?.id,
      },
    );

    return reply({ res, results: animal });
  }

  /** Get one Animal */
  @Get(`/view`)
  @UseGuards(JwtAuthGuard)
  async getOneByIdAnimal(
    @Res() res,
    @Req() req,
    @Query('animalId', ParseUUIDPipe) animalId: string,
  ) {
    const { user } = req;
    const findOneAnimal = await this.animalsService.findOneBy({
      animalId,
      organizationId: user.organizationId,
    });

    if (!findOneAnimal) {
      throw new HttpException(
        `Animal ${animalId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    return reply({ res, results: findOneAnimal });
  }

  /** Delete one Animal */
  @Delete(`/delete/:animalId`)
  @UseGuards(JwtAuthGuard)
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
    if (!findOneAnimal) {
      throw new HttpException(
        `Animal ${animalId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    await this.animalsService.updateOne(
      { animalId: findOneAnimal?.id },
      { deletedAt: new Date() },
    );

    return reply({ res, results: [HttpStatus.ACCEPTED, findOneAnimal] });
  }
}
