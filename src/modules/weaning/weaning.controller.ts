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
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { AnimalsService } from '../animals/animals.service';
import { BreedingsService } from '../breedings/breedings.service';
import { BreedsService } from '../breeds/breeds.service';
import { FarrowingsService } from '../farrowings/farrowings.service';
import { LocationsService } from '../locations/locations.service';
import { UserAuthGuard } from '../users/middleware';
import { CreateOrUpdateWeaningsDto, WeaningDto } from './weaning.dto';
import { WeaningsService } from './weaning.service';

@Controller('weanings')
export class WeaningsController {
  constructor(
    private readonly weaningsService: WeaningsService,
    private readonly animalsService: AnimalsService,
    private readonly breedsService: BreedsService,
    private readonly breedingsService: BreedingsService,
    private readonly locationsService: LocationsService,
    private readonly farrowingsService: FarrowingsService,
    private readonly activitylogsService: ActivityLogsService,
  ) {}

  @Get(`/`)
  @UseGuards(UserAuthGuard)
  async findAll(
    @Res() res,
    @Req() req,
    @Query() requestPaginationDto: RequestPaginationDto,
    @Query() query: SearchQueryDto,
    @Query() queryWeaning: WeaningDto,
  ) {
    const { user } = req;
    const { search } = query;
    const { animalTypeId, periode } = queryWeaning;

    const { take, page, sort, sortBy } = requestPaginationDto;
    const pagination: PaginationType = addPagination({
      page,
      take,
      sort,
      sortBy,
    });

    const weanings = await this.weaningsService.findAll({
      search,
      pagination,
      animalTypeId,
      periode: Number(periode),
      organizationId: user.organizationId,
    });

    return reply({ res, results: weanings });
  }

  /** Post one weaning */
  @Post(`/create`)
  @UseGuards(UserAuthGuard)
  async createOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateWeaningsDto,
  ) {
    const { user } = req;
    const { animals, code, weight, locationCode } = body;

    const findOneFemale = await this.animalsService.findOneBy({
      code,
      gender: 'FEMALE',
      status: 'ACTIVE',
      productionPhase: 'LACTATION',
      organizationId: user?.organizationId,
    });
    if (!findOneFemale)
      throw new HttpException(
        `Female animal ${code} doesn't exists, isn't in LACTATION phase  or isn't ACTIVE please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneFarrowing = await this.farrowingsService.findOneBy({
      animalId: findOneFemale?.id,
      animalTypeId: findOneFemale?.animalTypeId,
      organizationId: user?.organizationId,
    });
    if (!findOneFarrowing)
      throw new HttpException(
        `Farrowing doesn't exists, please change`,
        HttpStatus.NOT_FOUND,
      );

    if (animals?.length > Number(findOneFarrowing?.litter))
      throw new HttpException(
        `Weaning litter: ${animals?.length} can't be greater than farrowing litter: ${Number(findOneFarrowing?.litter)}`,
        HttpStatus.AMBIGUOUS,
      );

    for (const animal of animals) {
      const findOneAnimal = await this.animalsService.findOneBy({
        code: animal,
        organizationId: user?.organizationId,
        animalTypeId: findOneFemale?.animalTypeId,
      });
      if (!findOneAnimal)
        throw new HttpException(
          `Animal ${findOneAnimal?.code} doesn't exists please change`,
          HttpStatus.NOT_FOUND,
        );

      const findOneLocation = await this.locationsService.findOneBy({
        code: locationCode,
        organizationId: user?.organizationId,
        animalTypeId: findOneFemale?.animalTypeId,
      });
      if (!findOneLocation)
        throw new HttpException(
          `Location: ${locationCode} doesn't exists please change`,
          HttpStatus.NOT_FOUND,
        );

      await this.animalsService.updateOne(
        { animalId: findOneAnimal?.id },
        { locationId: findOneLocation?.id },
      );
    }

    await this.weaningsService.createOne({
      weight,
      litter: animals.length,
      animalId: findOneFemale?.id,
      farrowingId: findOneFarrowing?.id,
      farrowingLitter: findOneFarrowing?.litter,
      animalTypeId: findOneFemale?.animalTypeId,
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
    });

    await this.animalsService.updateOne(
      { animalId: findOneFemale?.id },
      { productionPhase: 'REPRODUCTION' },
    );

    await this.locationsService.updateOne(
      { locationId: findOneFemale?.locationId },
      { productionPhase: 'REPRODUCTION' },
    );

    await this.activitylogsService.createOne({
      userId: user?.id,
      organizationId: user?.organizationId,
      message: `${user?.profile?.firstName} ${user?.profile?.lastName} created a weaning in ${findOneFemale?.animalType?.name} for animal ${findOneFemale?.code}`,
    });

    return reply({ res, results: 'Animals weaned successfully' });
  }

  /** Update one Weaning */
  @Put(`/:weaningId/edit`)
  @UseGuards(UserAuthGuard)
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateWeaningsDto,
    @Param('weaningId', ParseUUIDPipe) weaningId: string,
  ) {
    const { user } = req;
    const { weight } = body;

    const findOneWeaning = await this.weaningsService.findOneBy({
      weaningId,
      organizationId: user?.organizationId,
    });
    if (!findOneWeaning)
      throw new HttpException(
        `WeaningId: ${weaningId} doesn't exists, please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneFarrowing = await this.farrowingsService.findOneBy({
      farrowingId: findOneWeaning?.farrowingId,
    });
    if (!findOneFarrowing)
      throw new HttpException(
        `Farrowing doesn't exists, please change`,
        HttpStatus.NOT_FOUND,
      );

    if (weight < findOneFarrowing?.weight)
      throw new HttpException(
        `Weaning weight: ${weight} can't be less than farrowing weight: ${findOneFarrowing?.weight}`,
        HttpStatus.AMBIGUOUS,
      );

    const weaning = await this.weaningsService.updateOne(
      { weaningId: findOneWeaning?.id },
      {
        weight,
        userCreatedId: user?.id,
      },
    );

    await this.activitylogsService.createOne({
      userId: user?.id,
      organizationId: user?.organizationId,
      message: `${user?.profile?.firstName} ${user?.profile?.lastName} updated a weaning in ${findOneWeaning?.animalType?.name} for animal ${findOneWeaning?.animal?.code}`,
    });

    return reply({ res, results: weaning });
  }

  /** Get one Weaning with farrowingId */
  @Get(`/:farrowingId/view`)
  @UseGuards(UserAuthGuard)
  async getOneByFarrowingId(
    @Res() res,
    @Req() req,
    @Param('farrowingId', ParseUUIDPipe) farrowingId: string,
  ) {
    const { user } = req;

    const findOneWeaning = await this.weaningsService.findOneBy({
      farrowingId,
      organizationId: user?.organizationId,
    });
    if (!findOneWeaning)
      throw new HttpException(
        `FarrowingId: ${farrowingId} doesn't exists, please change`,
        HttpStatus.NOT_FOUND,
      );

    return reply({ res, results: findOneWeaning });
  }

  /** Get one Weaning with animalId */
  @Get(`/:animalId/view/weaning`)
  @UseGuards(UserAuthGuard)
  async getOneByAnimalId(
    @Res() res,
    @Req() req,
    @Param('animalId', ParseUUIDPipe) animalId: string,
  ) {
    const { user } = req;

    const findOneWeaning = await this.weaningsService.findOneBy({
      animalId,
      organizationId: user?.organizationId,
    });
    if (!findOneWeaning)
      throw new HttpException(
        `AnimalId: ${animalId} doesn't exists, please change`,
        HttpStatus.NOT_FOUND,
      );

    return reply({ res, results: findOneWeaning });
  }

  /** Delete Weaning */
  @Delete(`/:weaningId/delete`)
  @UseGuards(UserAuthGuard)
  async deleteOne(
    @Res() res,
    @Req() req,
    @Param('weaningId', ParseUUIDPipe) weaningId: string,
  ) {
    const { user } = req;

    const findOneWeaning = await this.weaningsService.findOneBy({
      weaningId,
      organizationId: user?.organizationId,
    });
    if (!findOneWeaning)
      throw new HttpException(
        `WeaningId: ${weaningId} doesn't exists, please change`,
        HttpStatus.NOT_FOUND,
      );

    await this.weaningsService.updateOne(
      { weaningId: findOneWeaning?.id },
      { deletedAt: new Date() },
    );

    await this.animalsService.updateOne(
      { animalId: findOneWeaning?.animalId },
      { productionPhase: 'LACTATION' },
    );

    await this.activitylogsService.createOne({
      userId: user?.id,
      organizationId: user?.organizationId,
      message: `${user?.profile?.firstName} ${user?.profile?.lastName} deleted a weaning in ${findOneWeaning?.animalType?.name} for animal ${findOneWeaning?.animal?.code}`,
    });

    return reply({ res, results: 'Weaning deleted successfully' });
  }
}
