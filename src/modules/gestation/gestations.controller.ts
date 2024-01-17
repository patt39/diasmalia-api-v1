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
import { GestationsService } from './gestations.service';
import { SearchQueryDto } from '../../app/utils/search-query/search-query.dto';
import { CreateOrUpdateGestationsDto } from './gestations.dto';
import { RequestPaginationDto } from '../../app/utils/pagination/request-pagination.dto';
import {
  addPagination,
  PaginationType,
} from '../../app/utils/pagination/with-pagination';
import { JwtAuthGuard } from '../users/middleware';

@Controller('gestations')
export class GestationsController {
  constructor(private readonly gestationsService: GestationsService) {}

  /** Get all Gestations */
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

    const gestations = await this.gestationsService.findAll({
      search,
      pagination,
      organizationId: user?.organizationId,
    });

    return reply({ res, results: gestations });
  }

  /** Post one Gestation */
  @Post(`/`)
  @UseGuards(JwtAuthGuard)
  async createOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateGestationsDto,
  ) {
    const { user } = req;
    const { note, animalId, checkPregnancyId } = body;
    const gestation = await this.gestationsService.createOne({
      note,
      animalId,
      checkPregnancyId,
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
    });

    return reply({ res, results: gestation });
  }

  /** Update one Gestation */
  @Put(`/:gestationId`)
  @UseGuards(JwtAuthGuard)
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateGestationsDto,
    @Param('gestationId', ParseUUIDPipe) gestationId: string,
  ) {
    const { user } = req;
    const { note, animalId, checkPregnancyId } = body;

    const gestation = await this.gestationsService.updateOne(
      { gestationId },
      {
        note,
        animalId,
        checkPregnancyId,
        organizationId: user?.organizationId,
        userCreatedId: user?.id,
      },
    );

    return reply({ res, results: gestation });
  }

  /** Get one Gestation */
  @Get(`/view`)
  @UseGuards(JwtAuthGuard)
  async getOneByIdUser(
    @Res() res,
    @Query('gestationId', ParseUUIDPipe) gestationId: string,
  ) {
    const gestation = await this.gestationsService.findOneBy({
      gestationId,
    });

    return reply({ res, results: gestation });
  }

  /** Delete one Gestation */
  @Delete(`/delete/:gestationId`)
  @UseGuards(JwtAuthGuard)
  async deleteOne(
    @Res() res,
    @Param('gestationId', ParseUUIDPipe) gestationId: string,
  ) {
    const gestation = await this.gestationsService.updateOne(
      { gestationId },
      { deletedAt: new Date() },
    );

    return reply({ res, results: gestation });
  }
}
