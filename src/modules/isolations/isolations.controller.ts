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
  BulkIsolationsDto,
  CreateOrUpdateIsolationsDto,
} from './isolations.dto';
import { IsolationsService } from './isolations.service';

@Controller('isolations')
export class IsolationsController {
  constructor(
    private readonly isolationsService: IsolationsService,
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
  ) {
    const { user } = req;
    const { search } = query;

    const { take, page, sort } = requestPaginationDto;
    const pagination: PaginationType = addPagination({ page, take, sort });

    const castrations = await this.isolationsService.findAll({
      search,
      pagination,
      organizationId: user?.organizationId,
    });

    return reply({ res, results: castrations });
  }

  /** Post one isolation */
  @Post(`/create`)
  @UseGuards(UserAuthGuard)
  async createOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateIsolationsDto,
  ) {
    const { user } = req;
    const { date, note, code } = body;

    const findOneAnimal = await this.animalsService.findOneBy({
      code,
      status: 'ACTIVE',
    });
    if (!findOneAnimal)
      throw new HttpException(
        `Animal ${code} doesn't exists, isn't in REPRODUCTION phase  or isn't ACTIVE please change`,
        HttpStatus.NOT_FOUND,
      );

    const isolation = await this.isolationsService.createOne({
      date,
      note,
      animalId: findOneAnimal?.id,
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
    });

    return reply({ res, results: isolation });
  }

  /** Post one Bulk isolation */
  @Post(`/bulk/create`)
  @UseGuards(UserAuthGuard)
  async createOneBulk(@Res() res, @Req() req, @Body() body: BulkIsolationsDto) {
    const { user } = req;
    const { date, animals, note } = body;

    for (const animal of animals) {
      const findOneAnimal = await this.animalsService.findOneBy({
        status: 'ACTIVE',
        code: animal?.code,
      });
      if (!findOneAnimal) {
        throw new HttpException(
          `Animal ${findOneAnimal?.code} doesn't exists please change`,
          HttpStatus.NOT_FOUND,
        );
      }

      await this.isolationsService.createOne({
        date,
        note,
        animalId: findOneAnimal?.id,
        organizationId: findOneAnimal?.organizationId,
        userCreatedId: user?.id,
      });
    }

    return reply({ res, results: 'Saved' });
  }

  /** Update one isolation */
  @Put(`/:isolationId/edit`)
  @UseGuards(UserAuthGuard)
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateIsolationsDto,
    @Param('isolationId', ParseUUIDPipe) isolationId: string,
  ) {
    const { user } = req;
    const { date, note, code } = body;

    const findOneIsolation = await this.isolationsService.findOneBy({
      isolationId,
      organizationId: user?.organizationId,
    });
    if (!findOneIsolation)
      throw new HttpException(
        `IsolationId: ${isolationId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneAnimal = await this.animalsService.findOneBy({
      code,
      status: 'ACTIVE',
    });
    if (!findOneAnimal)
      throw new HttpException(
        `Animal ${code} doesn't exists or isn't ACTIVE please change`,
        HttpStatus.NOT_FOUND,
      );

    const isolation = await this.isolationsService.updateOne(
      { isolationId: findOneIsolation?.id },
      {
        date,
        note,
        animalId: findOneAnimal?.id,
        organizationId: user?.organizationId,
        userCreatedId: user?.id,
      },
    );

    return reply({ res, results: isolation });
  }

  /** Delete one isolation */
  @Delete(`/delete/:isolationId`)
  @UseGuards(UserAuthGuard)
  async deleteOne(
    @Res() res,
    @Req() req,
    @Param('isolationId', ParseUUIDPipe) isolationId: string,
  ) {
    const { user } = req;

    const findOneIsolation = await this.isolationsService.findOneBy({
      isolationId,
      organizationId: user?.organizationId,
    });
    if (!findOneIsolation) {
      throw new HttpException(
        `IsolationId: ${isolationId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    const isolation = await this.isolationsService.updateOne(
      { isolationId: findOneIsolation?.id },
      { deletedAt: new Date() },
    );

    return reply({ res, results: isolation });
  }
}
