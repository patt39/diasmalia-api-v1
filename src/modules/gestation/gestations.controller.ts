import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseUUIDPipe,
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
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { UserAuthGuard } from '../users/middleware';
import { GestationsQueryDto, UpdateGestationsDto } from './gestations.dto';
import { GestationsService } from './gestations.service';

@Controller('gestations')
export class GestationsController {
  constructor(
    private readonly gestationsService: GestationsService,
    private readonly activitylogsService: ActivityLogsService,
  ) {}

  /** Get all gestations */
  @Get(`/`)
  @UseGuards(UserAuthGuard)
  async findAll(
    @Res() res,
    @Req() req,
    @Query() requestPaginationDto: RequestPaginationDto,
    @Query() query: SearchQueryDto,
    @Query() queryGestation: GestationsQueryDto,
  ) {
    const { user } = req;
    const { search } = query;
    const { animalTypeId, periode } = queryGestation;

    const { take, page, sort, sortBy } = requestPaginationDto;
    const pagination: PaginationType = addPagination({
      page,
      take,
      sort,
      sortBy,
    });

    const gestations = await this.gestationsService.findAll({
      search,
      pagination,
      animalTypeId,
      periode: Number(periode),
      organizationId: user?.organizationId,
    });

    return reply({ res, results: gestations });
  }

  /** Update one gestation */
  @Put(`/:gestationId/edit`)
  @UseGuards(UserAuthGuard)
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: UpdateGestationsDto,
    @Param('gestationId', ParseUUIDPipe) gestationId: string,
  ) {
    const { user } = req;
    const { note, method, farrowingDate } = body;

    const findOneGestation = await this.gestationsService.findOneBy({
      gestationId,
      organizationId: user?.organization,
    });
    if (!findOneGestation) {
      throw new HttpException(
        `GestationId: ${gestationId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    const gestation = await this.gestationsService.updateOne(
      { gestationId: findOneGestation?.id },
      {
        note,
        method,
        farrowingDate,
        userCreatedId: user?.id,
      },
    );

    await this.activitylogsService.createOne({
      userId: user?.id,
      organizationId: user?.organizationId,
      message: `${user?.profile?.firstName} ${user?.profile?.lastName} updated a gestation, in ${findOneGestation?.animalType?.name} for ${findOneGestation?.animal?.code}`,
    });

    return reply({
      res,
      results: {
        status: HttpStatus.CREATED,
        data: gestation,
        message: 'Gestation updated successfully',
      },
    });
  }

  /** Get one gestation */
  @Get(`/:gestationId/view`)
  @UseGuards(UserAuthGuard)
  async getOneByIdGestation(
    @Res() res,
    @Req() req,
    @Param('gestationId', ParseUUIDPipe) gestationId: string,
  ) {
    const { user } = req;

    const findOneGestation = await this.gestationsService.findOneBy({
      gestationId,
      organizationId: user?.organization,
    });
    if (!findOneGestation) {
      throw new HttpException(
        `GestationId: ${gestationId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    return reply({ res, results: findOneGestation });
  }
}
