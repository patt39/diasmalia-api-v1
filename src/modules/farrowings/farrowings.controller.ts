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

import { formatDDMMYYDate } from 'src/app/utils/commons';
import { RequestPaginationDto } from '../../app/utils/pagination/request-pagination.dto';
import {
  addPagination,
  PaginationType,
} from '../../app/utils/pagination/with-pagination';
import { SearchQueryDto } from '../../app/utils/search-query/search-query.dto';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { AnimalsService } from '../animals/animals.service';
import { GestationsService } from '../gestation/gestations.service';
import { UserAuthGuard } from '../users/middleware';
import {
  CreateFarrowingsDto,
  FarrowingQueryDto,
  UpdateFarrowingsDto,
} from './farrowings.dto';
import { FarrowingsService } from './farrowings.service';

@Controller('farrowings')
export class FarrowingsController {
  constructor(
    private readonly farrowingsService: FarrowingsService,
    private readonly animalsService: AnimalsService,
    private readonly gestationsService: GestationsService,
    private readonly activitylogsService: ActivityLogsService,
  ) {}

  /** Get all farrowings */
  @Get(`/`)
  @UseGuards(UserAuthGuard)
  async findAll(
    @Res() res,
    @Req() req,
    @Query() requestPaginationDto: RequestPaginationDto,
    @Query() query: SearchQueryDto,
    @Query() queryFarrowing: FarrowingQueryDto,
  ) {
    const { user } = req;
    const { search } = query;
    const { animalTypeId, periode } = queryFarrowing;

    const { take, page, sort, sortBy } = requestPaginationDto;
    const pagination: PaginationType = addPagination({
      page,
      take,
      sort,
      sortBy,
    });

    const farrowings = await this.farrowingsService.findAll({
      search,
      pagination,
      animalTypeId,
      periode: Number(periode),
      organizationId: user?.organizationId,
    });

    return reply({ res, results: farrowings });
  }

  /** Post one farrowing */
  @Post(`/create`)
  @UseGuards(UserAuthGuard)
  async createOne(@Res() res, @Req() req, @Body() body: CreateFarrowingsDto) {
    const { user } = req;
    const { litter, note, codeFemale } = body;

    const findOneFemale = await this.animalsService.findOneBy({
      code: codeFemale,
      gender: 'FEMALE',
      status: 'ACTIVE',
      isIsolated: 'NO',
      productionPhase: 'GESTATION',
    });
    if (!findOneFemale)
      throw new HttpException(
        `Animal ${codeFemale} doesn't exists, isn't in GESTATION phase  or isn't ACTIVE please change`,
        HttpStatus.NOT_FOUND,
      );

    if (findOneFemale?.location?.animals.length > 1)
      throw new HttpException(
        `Animal ${codeFemale} should be isolated before farrowing please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneGestation = await this.gestationsService.findOneBy({
      animalId: findOneFemale?.id,
      organizationId: user?.organization,
    });
    if (!findOneGestation) {
      throw new HttpException(
        `Gestation doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    if (
      formatDDMMYYDate(findOneGestation?.farrowingDate) !==
      formatDDMMYYDate(new Date())
    )
      throw new HttpException(
        `Impossible to create, female: ${codeFemale} hasn't reach farrowing date yet please update`,
        HttpStatus.NOT_FOUND,
      );

    const farrowing = await this.farrowingsService.createOne({
      note,
      litter,
      animalId: findOneFemale?.id,
      animalTypeId: findOneFemale?.animalTypeId,
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
    });

    await this.animalsService.updateOne(
      { animalId: findOneFemale?.id },
      { productionPhase: 'LACTATION' },
    );

    await this.gestationsService.updateOne(
      { gestationId: findOneGestation?.id },
      { deletedAt: new Date() },
    );

    await this.activitylogsService.createOne({
      userId: user.id,
      organizationId: user.organizationId,
      message: `${user.profile?.firstName} ${user.profile?.lastName} created a farrowing in ${findOneFemale.animalType.name} for ${findOneFemale.code}`,
    });

    return reply({
      res,
      results: {
        status: HttpStatus.CREATED,
        data: farrowing,
        message:
          'Farrowing created successfully please change productionPhase to LACTATION',
      },
    });
  }

  /** Update one farrowing */
  @Put(`/:farrowingId/edit`)
  @UseGuards(UserAuthGuard)
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: UpdateFarrowingsDto,
    @Param('farrowingId', ParseUUIDPipe) farrowingId: string,
  ) {
    const { user } = req;
    const { litter, note } = body;

    const findOneFarrowing = await this.farrowingsService.findOneBy({
      farrowingId,
      organizationId: user.organizationId,
    });
    if (!findOneFarrowing)
      throw new HttpException(
        `FarrowingId: ${farrowingId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const farrowing = await this.farrowingsService.updateOne(
      { farrowingId: findOneFarrowing.id },
      { note, litter, userCreatedId: user.id },
    );

    await this.activitylogsService.createOne({
      userId: user.id,
      organizationId: user.organizationId,
      message: `${user.profile?.firstName} ${user.profile?.lastName} updated a farrowing in ${findOneFarrowing.animalType.name} for ${findOneFarrowing.animal.code}`,
    });

    return reply({
      res,
      results: {
        data: farrowing,
        message: 'Farrowing updated successfully',
      },
    });
  }

  /** Get one farrowing */
  @Get(`/:farrowingId/view`)
  @UseGuards(UserAuthGuard)
  async getOneByIdFarrowing(
    @Res() res,
    @Req() req,
    @Param('farrowingId', ParseUUIDPipe) farrowingId: string,
  ) {
    const { user } = req;

    const farrowing = await this.farrowingsService.findOneBy({
      farrowingId,
      organizationId: user.organizationId,
    });
    if (!farrowingId)
      throw new HttpException(
        `FarrowingId: ${farrowingId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    return reply({ res, results: farrowing });
  }

  /** Delete one farrowing */
  @Delete(`/:farrowingId/delete`)
  @UseGuards(UserAuthGuard)
  async deleteOne(
    @Res() res,
    @Req() req,
    @Param('farrowingId', ParseUUIDPipe) farrowingId: string,
  ) {
    const { user } = req;

    const findOneFarrowing = await this.farrowingsService.findOneBy({
      farrowingId,
      organizationId: user.organizationId,
    });
    if (!findOneFarrowing)
      throw new HttpException(
        `FarrowingId: ${farrowingId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    await this.farrowingsService.updateOne(
      { farrowingId: findOneFarrowing.id },
      { deletedAt: new Date() },
    );

    await this.animalsService.updateOne(
      { animalId: findOneFarrowing.animalId },
      { productionPhase: 'GESTATION' },
    );

    await this.activitylogsService.createOne({
      userId: user.id,
      organizationId: user.organizationId,
      message: `${user.profile?.firstName} ${user.profile?.lastName} deleted a farrowing in ${findOneFarrowing.animalType.name}`,
    });

    return reply({ res, results: 'Farrowing deleted successfully' });
  }
}
