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
import { AnimalTypesService } from '../animal-type/animal-type.service';
import { UserAuthGuard } from '../users/middleware';
import { CreateOrUpdateBreedsDto, GetBreedsTypeDto } from './breeds.dto';
import { BreedsService } from './breeds.service';

@Controller('breeds')
export class BreedsController {
  constructor(
    private readonly breedsService: BreedsService,
    private readonly animalTypesService: AnimalTypesService,
  ) {}

  /** Get all breeds */
  @Get(`/`)
  @UseGuards(UserAuthGuard)
  async findAll(
    @Res() res,
    @Req() req,
    @Query() requestPaginationDto: RequestPaginationDto,
    @Query() query: SearchQueryDto,
    @Query() queryTypes: GetBreedsTypeDto,
  ) {
    const { user } = req;
    const { search } = query;
    const { animalTypeId } = queryTypes;

    const { take, page, sort } = requestPaginationDto;
    const pagination: PaginationType = addPagination({ page, take, sort });

    const breeds = await this.breedsService.findAll({
      search,
      pagination,
      animalTypeId,
      organizationId: user?.organizationId,
    });

    return reply({ res, results: breeds });
  }

  /** Post one breed */
  @Post(`/create`)
  @UseGuards(UserAuthGuard)
  async createOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateBreedsDto,
  ) {
    const { user } = req;
    const { name, animalTypeId } = body;

    const findOneBreed = await this.breedsService.findOneBy({
      name,
    });
    if (findOneBreed)
      throw new HttpException(
        `Breed ${name} already exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const breed = await this.breedsService.createOne({
      name,
      animalTypeId,
    });

    return reply({ res, results: breed });
  }

  /** Update one breed */
  @Put(`/:breedId/edit`)
  @UseGuards(UserAuthGuard)
  async updateOne(
    @Res() res,
    @Body() body: CreateOrUpdateBreedsDto,
    @Param('breedId', ParseUUIDPipe) breedId: string,
  ) {
    const { name, animalTypeId } = body;

    const findOneBreed = await this.breedsService.findOneBy({
      breedId,
    });
    if (!findOneBreed)
      throw new HttpException(
        `BreedId: ${breedId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const breed = await this.breedsService.updateOne(
      { breedId: findOneBreed?.id },
      {
        name,
        animalTypeId,
      },
    );

    return reply({ res, results: breed });
  }

  /** Get one breed */
  @Get(`/view/:breedId`)
  @UseGuards(UserAuthGuard)
  async getOneByIdBreed(
    @Res() res,
    @Req() req,
    @Param('breedId') breedId: string,
  ) {
    const { user } = req;
    const findOneBreed = await this.breedsService.findOneBy({
      breedId,
    });
    if (!findOneBreed)
      throw new HttpException(
        `BreedId: ${breedId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    return reply({ res, results: findOneBreed });
  }

  /** Delete one breed */
  @Delete(`/delete/:breedId`)
  @UseGuards(UserAuthGuard)
  async deleteOne(
    @Res() res,
    @Req() req,
    @Param('BreedId', ParseUUIDPipe) breedId: string,
  ) {
    const { user } = req;
    const findOneBreed = await this.breedsService.findOneBy({
      breedId,
    });
    if (!findOneBreed)
      throw new HttpException(
        `BreedId: ${breedId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    await this.breedsService.updateOne(
      { breedId: findOneBreed?.id },
      { deletedAt: new Date() },
    );

    return reply({ res, results: 'Breed deleted successfully' });
  }
}
