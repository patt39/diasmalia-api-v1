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
import { AnimalsService } from '../animals/animals.service';
import { JwtAuthGuard } from '../users/middleware';
import { CreateOrUpdateDeathsDto } from './deaths.dto';
import { DeathsService } from './deaths.service';

@Controller('deaths')
export class DeathsController {
  constructor(
    private readonly deathsService: DeathsService,
    private readonly animalsService: AnimalsService,
  ) {}

  /** Get all deaths */
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

    const deaths = await this.deathsService.findAll({
      search,
      pagination,
      organizationId: user?.organizationId,
    });

    return reply({ res, results: deaths });
  }

  /** Post one death */
  @Post(`/`)
  @UseGuards(JwtAuthGuard)
  async createOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateDeathsDto,
  ) {
    const { user } = req;
    const { date, cause, method, codeAnimal, note } = body;

    const findOneAnimal = await this.animalsService.findOneBy({
      code: codeAnimal,
      organizationId: user.organizationId,
    });
    if (!findOneAnimal) {
      throw new HttpException(
        `Animal ${findOneAnimal.code} doesn't exists, isn't DEAD please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    const death = await this.deathsService.createOne({
      date,
      note,
      cause,
      method,
      animalId: findOneAnimal?.id,
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
    });

    return reply({ res, results: death });
  }

  /** Update one Death */
  @Put(`/:deathId`)
  @UseGuards(JwtAuthGuard)
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateDeathsDto,
    @Param('deathId', ParseUUIDPipe) deathId: string,
  ) {
    const { user } = req;
    const { date, cause, method, codeAnimal, note } = body;

    const findOneDeadAnimal = await this.deathsService.findOneBy({
      deathId,
      organizationId: user.organizationId,
    });
    if (!findOneDeadAnimal) {
      throw new HttpException(
        `${deathId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    const findOneAnimal = await this.animalsService.findOneBy({
      code: codeAnimal,
      organizationId: user.organizationId,
    });
    if (!findOneAnimal) {
      throw new HttpException(
        `Animal ${findOneAnimal.code} doesn't exists, isn't in DEAD please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    const death = await this.deathsService.updateOne(
      { deathId },
      {
        date,
        note,
        cause,
        method,
        animalId: findOneAnimal?.id,
        organizationId: user?.organizationId,
        userCreatedId: user?.id,
      },
    );

    return reply({ res, results: death });
  }

  /** Get one Death */
  @Get(`/view`)
  @UseGuards(JwtAuthGuard)
  async getOneByIdDeath(
    @Res() res,
    @Req() req,
    @Query('deathId', ParseUUIDPipe) deathId: string,
  ) {
    const { user } = req;
    const findOneDeadAnimal = await this.deathsService.findOneBy({
      deathId,
      organizationId: user.organizationId,
    });
    if (!findOneDeadAnimal) {
      throw new HttpException(
        `${deathId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    return reply({ res, results: findOneDeadAnimal });
  }

  /** Delete one Death */
  @Delete(`/delete/:deathId`)
  @UseGuards(JwtAuthGuard)
  async deleteOne(
    @Res() res,
    @Req() req,
    @Param('deathId', ParseUUIDPipe) deathId: string,
  ) {
    const { user } = req;
    const findOneDeadAnimal = await this.deathsService.findOneBy({
      deathId,
      organizationId: user.organizationId,
    });
    if (!findOneDeadAnimal) {
      throw new HttpException(
        `${deathId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }
    const death = await this.deathsService.updateOne(
      { deathId },
      { deletedAt: new Date() },
    );

    return reply({ res, results: death });
  }
}
