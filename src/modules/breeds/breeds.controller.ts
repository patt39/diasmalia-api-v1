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
import { JwtAuthGuard } from '../users/middleware';
import { CreateOrUpdateBreedsDto } from './breeds.dto';
import { BreedsService } from './breeds.service';

@Controller('breeds')
export class BreedsController {
  constructor(private readonly breedsService: BreedsService) {}

  /** Get all breeds */
  @Get(`/`)
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Res() res,
    @Req() req,
    @Query() requestPaginationDto: RequestPaginationDto,
    //@Query() queryTypes: GetBreedTypesDto,
    @Query() query: SearchQueryDto,
  ) {
    const { user } = req;
    const { search } = query;
    //const { type } = queryTypes;

    const { take, page, sort } = requestPaginationDto;
    const pagination: PaginationType = addPagination({ page, take, sort });

    const breeds = await this.breedsService.findAll({
      // type,
      search,
      pagination,
      organizationId: user?.organizationId,
    });

    return reply({ res, results: breeds });
  }

  /** Post one breed */
  @Post(`/`)
  @UseGuards(JwtAuthGuard)
  async createOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateBreedsDto,
  ) {
    const { user } = req;
    const { name, type } = body;

    const breed = await this.breedsService.createOne({
      name,
      type,
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
    });

    return reply({ res, results: breed });
  }

  /** Update one breed */
  @Put(`/:breedId`)
  @UseGuards(JwtAuthGuard)
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateBreedsDto,
    @Param('breedId', ParseUUIDPipe) breedId: string,
  ) {
    const { user } = req;
    const { name, type } = body;

    const findOneBreed = await this.breedsService.findOneBy({
      breedId,
    });

    if (!findOneBreed) {
      throw new HttpException(
        `${breedId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    const breed = await this.breedsService.updateOne(
      { breedId },
      {
        name,
        type,
        organizationId: user?.organizationId,
        userCreatedId: user?.id,
        updatedAt: new Date(),
      },
    );

    return reply({ res, results: breed });
  }

  /** Get one breed */
  @Get(`/view`)
  @UseGuards(JwtAuthGuard)
  async getOneByIdBreed(
    @Res() res,
    @Req() req,
    @Query('breedId', ParseUUIDPipe) breedId: string,
  ) {
    const { user } = req;
    const findOneBreed = await this.breedsService.findOneBy({
      breedId,
    });
    if (!findOneBreed) {
      throw new HttpException(
        `${breedId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    const breed = await this.breedsService.findOneBy({
      breedId,
      organizationId: user.organizationId,
    });

    return reply({ res, results: breed });
  }

  /** Delete one breed */
  @Delete(`/delete/:breedId`)
  @UseGuards(JwtAuthGuard)
  async deleteOne(
    @Res() res,
    @Param('BreedId', ParseUUIDPipe) breedId: string,
  ) {
    const findOneBreed = await this.breedsService.findOneBy({
      breedId,
    });
    if (!findOneBreed) {
      throw new HttpException(
        `${breedId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    const breed = await this.breedsService.updateOne(
      { breedId: findOneBreed.id },
      { deletedAt: new Date() },
    );

    return reply({ res, results: breed });
  }
}
