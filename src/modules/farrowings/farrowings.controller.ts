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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { reply } from '../../app/utils/reply';

import { FileInterceptor } from '@nestjs/platform-express';
import { RequestPaginationDto } from '../../app/utils/pagination/request-pagination.dto';
import {
  addPagination,
  PaginationType,
} from '../../app/utils/pagination/with-pagination';
import { SearchQueryDto } from '../../app/utils/search-query/search-query.dto';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { AnimalsService } from '../animals/animals.service';
import { BreedingsService } from '../breedings/breedings.service';
import { GestationsService } from '../gestation/gestations.service';
import { UploadsUtil } from '../integrations/integration.utils';
import { LocationsService } from '../locations/locations.service';
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
    private readonly uploadsUtil: UploadsUtil,
    private readonly farrowingsService: FarrowingsService,
    private readonly animalsService: AnimalsService,
    private readonly gestationsService: GestationsService,
    private readonly locationsService: LocationsService,
    private readonly breedingsService: BreedingsService,
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
    const { dead, litter, note, codeFemale, weight, farrowingDate } = body;

    const findOneFemale = await this.animalsService.findOneBy({
      code: codeFemale,
      gender: 'FEMALE',
      status: 'ACTIVE',
      isIsolated: 'NO',
      productionPhase: 'GESTATION',
    });
    if (!findOneFemale)
      throw new HttpException(
        `Animal ${findOneFemale?.code} doesn't exists, isn't in GESTATION phase  or isn't ACTIVE please change`,
        HttpStatus.NOT_FOUND,
      );

    if (findOneFemale?.location?._count?.animals !== 1)
      throw new HttpException(
        `Impossible to create ${findOneFemale?.code} isn't isolated please do`,
        HttpStatus.NOT_FOUND,
      );

    const findOneGestation = await this.gestationsService.findOneBy({
      animalId: findOneFemale?.id,
      organizationId: user?.organizationId,
    });
    if (!findOneGestation) {
      throw new HttpException(
        `Gestation doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    const findOneBreeding = await this.breedingsService.findOneBy({
      animalFemaleId: findOneFemale?.id,
      organizationId: user?.organizationId,
    });
    if (!findOneBreeding) {
      throw new HttpException(
        `Breeding doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    const farrowing = await this.farrowingsService.createOne({
      dead,
      note,
      litter,
      weight,
      animalId: findOneFemale?.id,
      breedingId: findOneBreeding?.id,
      farrowingDate: new Date(farrowingDate),
      animalTypeId: findOneFemale?.animalTypeId,
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
    });

    await this.animalsService.updateOne(
      { animalId: findOneFemale?.id },
      { productionPhase: 'LACTATION' },
    );

    await this.locationsService.updateOne(
      { locationId: findOneFemale?.locationId },
      { productionPhase: 'LACTATION' },
    );

    await this.gestationsService.updateOne(
      { gestationId: findOneGestation?.id },
      { deletedAt: new Date() },
    );

    await this.activitylogsService.createOne({
      userId: user?.id,
      organizationId: user?.organizationId,
      message: `${user?.profile?.firstName} ${user?.profile?.lastName} created a farrowing in ${findOneFemale?.animalType?.name} for ${findOneFemale?.code}`,
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
  @UseInterceptors(FileInterceptor('image'))
  @UseGuards(UserAuthGuard)
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: UpdateFarrowingsDto,
    @UploadedFile() file: Express.Multer.File,
    @Param('farrowingId', ParseUUIDPipe) farrowingId: string,
  ) {
    const { user } = req;
    const { litter, note, weight, dead } = body;

    const findOneFarrowing = await this.farrowingsService.findOneBy({
      farrowingId,
      organizationId: user?.organizationId,
    });
    if (!findOneFarrowing)
      throw new HttpException(
        `FarrowingId: ${farrowingId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const { urlAWS } = await this.uploadsUtil.uploadOneAWS({
      file,
      userId: user?.id,
      folder: 'photos',
    });

    const farrowing = await this.farrowingsService.updateOne(
      { farrowingId: findOneFarrowing?.id },
      {
        dead,
        note,
        litter,
        weight,
        image: urlAWS?.Location,
      },
    );

    await this.activitylogsService.createOne({
      userId: user?.id,
      organizationId: user?.organizationId,
      message: `${user?.profile?.firstName} ${user?.profile?.lastName} updated a farrowing in ${findOneFarrowing?.animalType?.name} for ${findOneFarrowing?.animal?.code}`,
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
      organizationId: user?.organizationId,
    });
    if (!farrowingId)
      throw new HttpException(
        `FarrowingId: ${farrowingId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    return reply({ res, results: farrowing });
  }

  /** Get one farrowing by animal */
  @Get(`/:animalId/view/animal`)
  @UseGuards(UserAuthGuard)
  async getOneByAnimalId(
    @Res() res,
    @Req() req,
    @Param('animalId', ParseUUIDPipe) animalId: string,
  ) {
    const { user } = req;

    const farrowing = await this.farrowingsService.findOneBy({
      animalId,
      organizationId: user?.organizationId,
    });
    if (!animalId)
      throw new HttpException(
        `FarrowingId: ${animalId} doesn't exists please change`,
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
      { farrowingId: findOneFarrowing?.id },
      { deletedAt: new Date() },
    );

    await this.animalsService.updateOne(
      { animalId: findOneFarrowing.animalId },
      { productionPhase: 'GESTATION' },
    );

    await this.activitylogsService.createOne({
      userId: user?.id,
      organizationId: user?.organizationId,
      message: `${user?.profile?.firstName} ${user?.profile?.lastName} deleted a farrowing in ${findOneFarrowing?.animalType.name} for ${findOneFarrowing?.animal?.code}`,
    });

    return reply({ res, results: 'Farrowing deleted successfully' });
  }
}
