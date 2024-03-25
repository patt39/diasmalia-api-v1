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
import { BatchsService } from '../batchs/batchs.service';
import { UserAuthGuard } from '../users/middleware';
import { CreateOrUpdateDeathsDto } from './deaths.dto';
import { DeathsService } from './deaths.service';

@Controller('deaths')
export class DeathsController {
  constructor(
    private readonly deathsService: DeathsService,
    private readonly batchsService: BatchsService,
  ) {}

  /** Get all deaths */
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

    const deaths = await this.deathsService.findAll({
      search,
      pagination,
      organizationId: user?.organizationId,
    });

    return reply({ res, results: deaths });
  }

  /** Post one death */
  @Post(`/create`)
  @UseGuards(UserAuthGuard)
  async createOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateDeathsDto,
  ) {
    const { user } = req;
    const { date, number, note, batchId } = body;

    const findOneBatch = await this.batchsService.findOneBy({
      batchId,
    });
    if (!findOneBatch)
      throw new HttpException(
        `BatchId: ${batchId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const death = await this.deathsService.createOne({
      date,
      note,
      number,
      batchId: findOneBatch?.id,
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
    });

    return reply({ res, results: death });
  }

  /** Get one Death */
  @Get(`/view/:deathId`)
  @UseGuards(UserAuthGuard)
  async getOneByIdDeath(
    @Res() res,
    @Req() req,
    @Param('deathId', ParseUUIDPipe) deathId: string,
  ) {
    const { user } = req;
    const findOneDeadAnimal = await this.deathsService.findOneBy({
      deathId,
      organizationId: user?.organizationId,
    });
    if (!findOneDeadAnimal)
      throw new HttpException(
        `DeathId: ${deathId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    return reply({ res, results: findOneDeadAnimal });
  }

  /** Update one death */
  @Put(`/:deathId/edit`)
  @UseGuards(UserAuthGuard)
  async updateOneBulk(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateDeathsDto,
    @Param('deathId', ParseUUIDPipe) deathId: string,
  ) {
    const { user } = req;
    const { date, number, note, batchId } = body;

    const findOneDeath = await this.deathsService.findOneBy({
      deathId,
      organizationId: user?.organizationId,
    });
    if (!findOneDeath)
      throw new HttpException(
        `DeathId: ${deathId} please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneBatch = await this.batchsService.findOneBy({
      batchId,
    });
    if (!findOneBatch)
      throw new HttpException(
        `Animal ${batchId} doesn't exists, isn't ACTIVE, please change`,
        HttpStatus.NOT_FOUND,
      );

    await this.deathsService.createOne({
      date,
      note,
      number,
      batchId: findOneBatch?.id,
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
    });

    return reply({ res, results: 'Death updated successfully' });
  }

  /** Delete one Death */
  @Delete(`/delete/:deathId`)
  @UseGuards(UserAuthGuard)
  async deleteOne(
    @Res() res,
    @Req() req,
    @Param('deathId', ParseUUIDPipe) deathId: string,
  ) {
    const { user } = req;
    const findOneDeadAnimal = await this.deathsService.findOneBy({
      deathId,
      organizationId: user?.organizationId,
    });
    if (!findOneDeadAnimal)
      throw new HttpException(
        `DeathId: ${deathId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const death = await this.deathsService.updateOne(
      { deathId: findOneDeadAnimal?.id },
      { deletedAt: new Date() },
    );

    return reply({ res, results: death });
  }
}
