import {
  Body,
  Controller,
  Delete,
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
import { AnimalsService } from '../animals/animals.service';
import { AssignTypesService } from '../assigne-type/assigne-type.service';
import { UserAuthGuard } from '../users/middleware';
import {
  CreateOrUpdateGestationsDto,
  GestationsQueryDto,
} from './gestations.dto';
import { GestationsService } from './gestations.service';

@Controller('gestations')
export class GestationsController {
  constructor(
    private readonly gestationsService: GestationsService,
    private readonly animalsService: AnimalsService,
    private readonly activitylogsService: ActivityLogsService,
    private readonly assignTypesService: AssignTypesService,
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
    const { animalTypeId } = queryGestation;

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
      organizationId: user?.organizationId,
    });

    return reply({ res, results: gestations });
  }

  /** Update one gestation */
  @Put(`/:gestationId`)
  @UseGuards(UserAuthGuard)
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateGestationsDto,
    @Param('gestationId', ParseUUIDPipe) gestationId: string,
  ) {
    const { user } = req;
    const { note, farrowingDate } = body;

    const findOneGestation = await this.gestationsService.findOneBy({
      gestationId,
      organizationId: user.organization,
    });
    if (!findOneGestation) {
      throw new HttpException(
        `GestationId: ${gestationId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    const gestation = await this.gestationsService.updateOne(
      { gestationId: findOneGestation.id },
      {
        note,
        farrowingDate,
        userCreatedId: user.id,
      },
    );

    await this.activitylogsService.createOne({
      userId: user.id,
      organizationId: user.organizationId,
      message: `${user.profile?.firstName} ${user.profile?.lastName} updated a gestation, in ${findOneGestation.animalType.name} for ${findOneGestation.animal.code}`,
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
  @Get(`/view/gestationId`)
  @UseGuards(UserAuthGuard)
  async getOneByIdGestation(
    @Res() res,
    @Req() req,
    @Param('gestationId', ParseUUIDPipe) gestationId: string,
  ) {
    const { user } = req;

    const findOneGestation = await this.gestationsService.findOneBy({
      gestationId,
      organizationId: user.organization,
    });
    if (!findOneGestation) {
      throw new HttpException(
        `GestationId: ${gestationId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    return reply({ res, results: findOneGestation });
  }

  /** Delete one gestation */
  @Delete(`/delete/:gestationId`)
  @UseGuards(UserAuthGuard)
  async deleteOne(
    @Res() res,
    @Req() req,
    @Param('gestationId', ParseUUIDPipe) gestationId: string,
  ) {
    const { user } = req;

    const findOneGestation = await this.gestationsService.findOneBy({
      gestationId,
      organizationId: user.organization,
    });
    if (!findOneGestation) {
      throw new HttpException(
        `GestationId: ${gestationId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    await this.gestationsService.updateOne(
      { gestationId: findOneGestation?.id },
      { deletedAt: new Date() },
    );

    await this.activitylogsService.createOne({
      userId: user.id,
      organizationId: user.organizationId,
      message: `${user.profile?.firstName} ${user.profile?.lastName} deleted a gestation in ${findOneGestation.animalType.name} for ${findOneGestation.animal.code}`,
    });

    return reply({ res, results: 'Gestation deleted successfully' });
  }
}
