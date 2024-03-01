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
import { AnimalsService } from '../animals/animals.service';
import { JwtAuthGuard } from '../users/middleware';
import { CreateOrUpdateCastrationsDto } from './castrations.dto';
import { CastrationsService } from './castrations.service';

@Controller('castrations')
export class CastrationsController {
  constructor(
    private readonly castrationsService: CastrationsService,
    private readonly animalsService: AnimalsService,
  ) {}

  /** Get all castrations */
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

    const castrations = await this.castrationsService.findAll({
      search,
      pagination,
      organizationId: user?.organizationId,
    });

    return reply({ res, results: castrations });
  }

  /** Post one castration */
  @Post(`/`)
  @UseGuards(JwtAuthGuard)
  async createOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateCastrationsDto,
  ) {
    const { user } = req;
    const { date, method, note, maleCode } = body;

    const findOneAnimal = await this.animalsService.findOneBy({
      code: maleCode,
      gender: 'MALE',
    });
    if (!findOneAnimal)
      throw new HttpException(
        `Animal doesn't exists or isn't MALE please change`,
        HttpStatus.NOT_FOUND,
      );

    const castration = await this.castrationsService.createOne({
      date,
      note,
      method,
      animalId: findOneAnimal?.id,
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
    });

    return reply({ res, results: castration });
  }

  /** Update one castration */
  @Put(`/:castrationId`)
  @UseGuards(JwtAuthGuard)
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateCastrationsDto,
    @Param('castrationId', ParseUUIDPipe) castrationId: string,
  ) {
    const { user } = req;
    const { date, note, method, maleCode } = body;

    const findOneCastration = await this.castrationsService.findOneBy({
      castrationId,
      organizationId: user?.organizationId,
    });
    if (!findOneCastration)
      throw new HttpException(
        `CastrationId: ${castrationId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneAnimal = await this.animalsService.findOneBy({
      code: maleCode,
      gender: 'MALE',
      organizationId: user?.organizationId,
    });
    if (!findOneAnimal)
      throw new HttpException(
        `Animal doesn't exists or isn't MALE please change`,
        HttpStatus.NOT_FOUND,
      );

    const castration = await this.castrationsService.updateOne(
      { castrationId: findOneCastration?.id },
      {
        date,
        note,
        method,
        animalId: findOneAnimal?.id,
        organizationId: user?.organizationId,
        userCreatedId: user?.id,
      },
    );

    return reply({ res, results: castration });
  }

  /** Delete one castration */
  @Delete(`/delete/:castrationId`)
  @UseGuards(JwtAuthGuard)
  async deleteOne(
    @Res() res,
    @Req() req,
    @Param('castrationId', ParseUUIDPipe) castrationId: string,
  ) {
    const { user } = req;

    const findOneCastration = await this.castrationsService.findOneBy({
      castrationId,
      organizationId: user?.organizationId,
    });
    if (!findOneCastration) {
      throw new HttpException(
        `CastrationId: ${castrationId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    const castration = await this.castrationsService.updateOne(
      { castrationId: findOneCastration?.id },
      { deletedAt: new Date() },
    );

    return reply({ res, results: castration });
  }
}
