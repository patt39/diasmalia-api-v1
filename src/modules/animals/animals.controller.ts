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
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { reply } from '../../app/utils/reply';
import { AnimalsService } from './animals.service';
import { LocationsService } from '../locations/locations.service';
import { SearchQueryDto } from '../../app/utils/search-query/search-query.dto';
import { CreateOrUpdateAnimalsDto } from './animals.dto';
import { RequestPaginationDto } from '../../app/utils/pagination/request-pagination.dto';
import {
  addPagination,
  PaginationType,
} from '../../app/utils/pagination/with-pagination';
import { JwtAuthGuard } from '../users/middleware';
import { BreedsService } from '../breeds/breeds.service';
import { AnimalStatusesService } from '../animal-statuses/animal-statuses.service';

@Controller('animals')
export class AnimalsController {
  constructor(
    private readonly animalsService: AnimalsService,
    private readonly locationsService: LocationsService,
    private readonly breedsService: BreedsService,
    private readonly animalStatusesService: AnimalStatusesService,
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

    return reply({ res, results: [HttpStatus.ACCEPTED, animals] });
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
      codeFather,
      codeMother,
      birthday,
      weight,
      gender,
      type,
      productionPhase,
      electronicCode,
      animalStatusId,
      locationId,
      breedId,
    } = body;

    const findOneLocation = await this.locationsService.findOneBy({
      locationId,
    });

    if (!findOneLocation)
      throw new HttpException(
        `Location number:${findOneLocation.number} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const breed = await this.breedsService.findOneBy({
      breedId,
    });

    const findoneStatus = await this.animalStatusesService.findOneBy({
      animalStatusId,
    });

    const animal = await this.animalsService.createOne({
      code,
      codeFather,
      codeMother,
      birthday,
      weight,
      gender,
      type,
      productionPhase,
      electronicCode,
      animalStatusId: findoneStatus?.id,
      locationId: findOneLocation?.id,
      breedId: breed?.id,
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
    });

    return reply({ res, results: [HttpStatus.CREATED, animal] });
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
    if (!animalId) {
      throw new HttpException(
        `Animal ${animalId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }
    const {
      code,
      codeFather,
      codeMother,
      birthday,
      weight,
      gender,
      type,
      productionPhase,
      electronicCode,
      animalStatusId,
      locationId,
      breedId,
    } = body;

    const findOneLocation = await this.locationsService.findOneBy({
      locationId,
    });

    if (!findOneLocation)
      throw new HttpException(
        `Location number:${findOneLocation.number} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const breed = await this.breedsService.findOneBy({
      breedId,
    });

    const findoneStatus = await this.animalStatusesService.findOneBy({
      animalStatusId,
    });

    const animal = await this.animalsService.updateOne(
      { animalId },
      {
        code,
        codeFather,
        codeMother,
        birthday,
        weight,
        gender,
        type,
        productionPhase,
        electronicCode,
        animalStatusId: findoneStatus.id,
        locationId: findOneLocation.id,
        breedId: breed.id,
        organizationId: user?.organizationId,
        userCreatedId: user?.id,
      },
    );

    return reply({ res, results: [HttpStatus.ACCEPTED, animal] });
  }

  /** Get one Animal */
  @Get(`/view`)
  @UseGuards(JwtAuthGuard)
  async getOneByIdUser(
    @Res() res,
    @Query('animalId', ParseUUIDPipe) animalId: string,
  ) {
    const animal = await this.animalsService.findOneBy({
      animalId,
    });
    if (!animalId) {
      throw new HttpException(
        `Animal ${animalId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    return reply({ res, results: animal });
  }

  /** Delete one Animal */
  @Delete(`/delete/:animalId`)
  @UseGuards(JwtAuthGuard)
  async deleteOne(
    @Res() res,
    @Param('animalId', ParseUUIDPipe) animalId: string,
  ) {
    if (!animalId) {
      throw new HttpException(
        `Animal ${animalId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }
    const animal = await this.animalsService.updateOne(
      { animalId },
      { deletedAt: new Date() },
    );

    return reply({ res, results: [HttpStatus.ACCEPTED, animal] });
  }
}
