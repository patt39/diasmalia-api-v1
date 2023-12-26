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
} from '@nestjs/common';
import { reply } from '../../app/utils/reply';

import { AnimalsService } from './animals.service';
import { SearchQueryDto } from '../../app/utils/search-query/search-query.dto';
import { CreateOrUpdateAnimalsDto } from './animals.dto';
import { RequestPaginationDto } from '../../app/utils/pagination/request-pagination.dto';
import {
  addPagination,
  PaginationType,
} from '../../app/utils/pagination/with-pagination';
import { JwtAuthGuard } from '../users/middleware';

@Controller('animals')
export class AnimalsController {
  constructor(private readonly animalsService: AnimalsService) {}

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

  /** Post one Animals */
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
      productionPhase,
      electronicCode,
      animalStatusId,
      locationId,
      breedId,
    } = body;

    const animal = await this.animalsService.createOne({
      code,
      codeFather,
      codeMother,
      birthday,
      weight,
      gender,
      productionPhase,
      electronicCode,
      animalStatusId,
      locationId,
      breedId,
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
    });

    return reply({ res, results: animal });
  }

  /** Post one Animals */
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
      codeFather,
      codeMother,
      birthday,
      weight,
      gender,
      productionPhase,
      electronicCode,
      animalStatusId,
      locationId,
      breedId,
    } = body;

    const animal = await this.animalsService.updateOne(
      { animalId },
      {
        code,
        codeFather,
        codeMother,
        birthday,
        weight,
        gender,
        productionPhase,
        electronicCode,
        animalStatusId,
        locationId,
        breedId,
        organizationId: user?.organizationId,
        userCreatedId: user?.id,
      },
    );

    return reply({ res, results: animal });
  }

  /** Get one Animals */
  @Get(`/view`)
  @UseGuards(JwtAuthGuard)
  async getOneByIdUser(
    @Res() res,
    @Query('animalId', ParseUUIDPipe) animalId: string,
  ) {
    const animal = await this.animalsService.findOneBy({
      animalId,
    });

    return reply({ res, results: animal });
  }

  /** Delete one Animals */
  @Delete(`/delete/:animalId`)
  @UseGuards(JwtAuthGuard)
  async deleteOne(
    @Res() res,
    @Param('animalId', ParseUUIDPipe) animalId: string,
  ) {
    const animal = await this.animalsService.updateOne(
      { animalId },
      { deletedAt: new Date() },
    );

    return reply({ res, results: animal });
  }
}
