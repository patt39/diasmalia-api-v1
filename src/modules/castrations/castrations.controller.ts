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
import { UserAuthGuard } from '../users/middleware';
import {
  BulkCastrationsDto,
  CreateOrUpdateCastrationsDto,
  GetCastrationsByMethodDto,
} from './castrations.dto';
import { CastrationsService } from './castrations.service';

@Controller('castrations')
export class CastrationsController {
  constructor(
    private readonly castrationsService: CastrationsService,
    private readonly animalsService: AnimalsService,
  ) {}

  /** Get all castrations */
  @Get(`/`)
  @UseGuards(UserAuthGuard)
  async findAll(
    @Res() res,
    @Req() req,
    @Query() requestPaginationDto: RequestPaginationDto,
    @Query() query: SearchQueryDto,
    @Query() queryMethod: GetCastrationsByMethodDto,
  ) {
    const { user } = req;
    const { search } = query;
    const { method } = queryMethod;

    const { take, page, sort } = requestPaginationDto;
    const pagination: PaginationType = addPagination({ page, take, sort });

    const castrations = await this.castrationsService.findAll({
      search,
      method,
      pagination,
      organizationId: user?.organizationId,
    });

    return reply({ res, results: castrations });
  }

  /** Post one castration */
  @Post(`/create`)
  @UseGuards(UserAuthGuard)
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
      status: 'ACTIVE',
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

  /** Post one Bulk castration */
  @Post(`/bulk/create`)
  @UseGuards(UserAuthGuard)
  async createOneBulk(
    @Res() res,
    @Req() req,
    @Body() body: BulkCastrationsDto,
  ) {
    const { user } = req;
    const { date, method, animals, note } = body;

    for (const animal of animals) {
      const findOneMale = await this.animalsService.findOneBy({
        status: 'ACTIVE',
        code: animal?.code,
        gender: 'MALE',
      });
      if (!findOneMale)
        throw new HttpException(
          `Animal ${findOneMale?.code} doesn't exists please change`,
          HttpStatus.NOT_FOUND,
        );

      await this.castrationsService.createOne({
        note,
        date,
        method,
        animalId: findOneMale?.id,
        organizationId: user?.organizationId,
        userCreatedId: user?.id,
      });
    }

    return reply({ res, results: 'Saved' });
  }

  /** Update one castration */
  @Put(`/:castrationId/edit`)
  @UseGuards(UserAuthGuard)
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
      status: 'ACTIVE',
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
  @UseGuards(UserAuthGuard)
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
    if (!findOneCastration)
      throw new HttpException(
        `CastrationId: ${castrationId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    await this.castrationsService.updateOne(
      { castrationId: findOneCastration?.id },
      { deletedAt: new Date() },
    );

    return reply({ res, results: 'Castration deleted successfully' });
  }
}
