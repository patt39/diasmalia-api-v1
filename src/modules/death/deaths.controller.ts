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
import { DeathsService } from './deaths.service';
import { SearchQueryDto } from '../../app/utils/search-query/search-query.dto';
import { CreateOrUpdateDeathsDto } from './deaths.dto';
import { RequestPaginationDto } from '../../app/utils/pagination/request-pagination.dto';
import {
  addPagination,
  PaginationType,
} from '../../app/utils/pagination/with-pagination';
import { JwtAuthGuard } from '../users/middleware';

@Controller('deaths')
export class DeathsController {
  constructor(private readonly deathsService: DeathsService) {}

  /** Get all Deaths */
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

  /** Post one Death */
  @Post(`/`)
  @UseGuards(JwtAuthGuard)
  async createOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateDeathsDto,
  ) {
    const { user } = req;
    const { date, cause, method, animalId, note } = body;
    const death = await this.deathsService.createOne({
      date,
      cause,
      method,
      animalId,
      note,
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
    const { date, cause, animalId, note } = body;

    const death = await this.deathsService.updateOne(
      { deathId },
      {
        date,
        cause,
        animalId,
        note,
        organizationId: user?.organizationId,
        userCreatedId: user?.id,
      },
    );

    return reply({ res, results: death });
  }

  /** Get one Death */
  @Get(`/view`)
  @UseGuards(JwtAuthGuard)
  async getOneByIdUser(
    @Res() res,
    @Query('deathId', ParseUUIDPipe) deathId: string,
  ) {
    const death = await this.deathsService.findOneBy({
      deathId,
    });

    return reply({ res, results: death });
  }

  /** Delete one Death */
  @Delete(`/delete/:deathId`)
  @UseGuards(JwtAuthGuard)
  async deleteOne(
    @Res() res,
    @Param('deathId', ParseUUIDPipe) deathId: string,
  ) {
    const death = await this.deathsService.updateOne(
      { deathId },
      { deletedAt: new Date() },
    );

    return reply({ res, results: death });
  }
}
