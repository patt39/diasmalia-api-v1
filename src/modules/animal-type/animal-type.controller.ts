import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Put,
  Query,
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
import { UserAuthGuard } from '../users/middleware';
import {
  CreateOrUpdateAnimalTypesDto,
  GetAnimalTypesByStatusQuery,
} from './animal-type.dto';
import { AnimalTypesService } from './animal-type.service';

@Controller('animal-type')
export class AnimalTypesController {
  constructor(private readonly animalTypesService: AnimalTypesService) {}

  @Get(`/`)
  @UseGuards(UserAuthGuard)
  async findAll(
    @Res() res,
    @Query() requestPaginationDto: RequestPaginationDto,
    @Query() query: SearchQueryDto,
    @Query() animalTypeQuery: GetAnimalTypesByStatusQuery,
  ) {
    const { search } = query;
    const { status } = animalTypeQuery;

    const { take, page, sort, sortBy } = requestPaginationDto;
    const pagination: PaginationType = addPagination({
      page,
      take,
      sort,
      sortBy,
    });

    const animalType = await this.animalTypesService.findAll({
      status,
      search,
      pagination,
    });

    return reply({ res, results: animalType });
  }

  /** Update one animalType */
  @Put(`/:animalTypeId/edit`)
  @UseGuards(UserAuthGuard)
  async updateOne(
    @Res() res,
    @Body() body: CreateOrUpdateAnimalTypesDto,
    @Param('animalTypeId', ParseUUIDPipe) animalTypeId: string,
  ) {
    const { name, photo, slug, habitat, description, status } = body;

    const findOneType = await this.animalTypesService.findOneBy({
      animalTypeId,
    });
    if (!findOneType)
      throw new HttpException(
        `AnimalTypeId: ${animalTypeId} doesn't exists, please change`,
        HttpStatus.NOT_FOUND,
      );

    const animalType = await this.animalTypesService.updateOne(
      { animalTypeId: findOneType?.id },
      {
        name,
        photo,
        slug,
        status,
        habitat,
        description,
      },
    );

    return reply({ res, results: animalType });
  }

  /** Get one animalType */
  @Get(`/view/:animalTypeId`)
  @UseGuards(UserAuthGuard)
  async getOneByIdWeaning(
    @Res() res,
    @Param('animalTypeId', ParseUUIDPipe) animalTypeId: string,
  ) {
    const findOneType = await this.animalTypesService.findOneBy({
      animalTypeId,
    });
    if (!findOneType)
      throw new HttpException(
        `AimalTypeId: ${animalTypeId} doesn't exists, please change`,
        HttpStatus.NOT_FOUND,
      );

    return reply({ res, results: findOneType });
  }

  /** Delete animalType */
  @Delete(`/delete/:animalTypeId`)
  @UseGuards(UserAuthGuard)
  async deleteOne(
    @Res() res,
    @Param('animalTypeId', ParseUUIDPipe) animalTypeId: string,
  ) {
    const findOneType = await this.animalTypesService.findOneBy({
      animalTypeId,
    });
    if (!findOneType)
      throw new HttpException(
        `AnimalTypeId: ${animalTypeId} doesn't exists, please change`,
        HttpStatus.NOT_FOUND,
      );

    await this.animalTypesService.updateOne(
      { animalTypeId: findOneType?.id },
      { deletedAt: new Date() },
    );

    return reply({ res, results: 'AnimalType deleted successfully' });
  }
}
