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

import { BreedsService } from './breeds.service';
import { SearchQueryDto } from '../../app/utils/search-query/search-query.dto';
import { CreateOrUpdateBreedsDto } from './breeds.dto';
import { RequestPaginationDto } from '../../app/utils/pagination/request-pagination.dto';
import {
  addPagination,
  PaginationType,
} from '../../app/utils/pagination/with-pagination';
import { JwtAuthGuard } from '../users/middleware';

@Controller('breeds')
export class BreedsController {
  constructor(private readonly breedsService: BreedsService) {}

  /** Get all Breeds */
  @Get(`/`)
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Res() res,
    @Req() req,
    @Query() requestPaginationDto: RequestPaginationDto,
    @Query() query: SearchQueryDto,
  ) {
    const { search } = query;

    const { take, page, sort } = requestPaginationDto;
    const pagination: PaginationType = addPagination({ page, take, sort });

    const breeds = await this.breedsService.findAll({
      search,
      pagination,
    });

    return reply({ res, results: breeds });
  }

  /** Post one Breeds */
  @Post(`/`)
  @UseGuards(JwtAuthGuard)
  async createOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateBreedsDto,
  ) {
    const { name } = body;

    const breed = await this.breedsService.createOne({
      name,
    });

    return reply({ res, results: breed });
  }

  /** Post one Breeds */
  @Put(`/:breedId`)
  @UseGuards(JwtAuthGuard)
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateBreedsDto,
    @Param('breedId', ParseUUIDPipe) breedId: string,
  ) {
    const { name } = body;

    const breed = await this.breedsService.updateOne(
      { breedId },
      {
        name,
      },
    );

    return reply({ res, results: breed });
  }

  /** Get one Breeds */
  @Get(`/view`)
  @UseGuards(JwtAuthGuard)
  async getOneByIdUser(
    @Res() res,
    @Query('breedId', ParseUUIDPipe) breedId: string,
  ) {
    const breed = await this.breedsService.findOneBy({
      breedId,
    });

    return reply({ res, results: breed });
  }

  /** Delete one Breeds */
  @Delete(`/delete/:breedId`)
  @UseGuards(JwtAuthGuard)
  async deleteOne(
    @Res() res,
    @Param('BreedId', ParseUUIDPipe) breedId: string,
  ) {
    const breed = await this.breedsService.updateOne(
      { breedId },
      { deletedAt: new Date() },
    );

    return reply({ res, results: breed });
  }
}
