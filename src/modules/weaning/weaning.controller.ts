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
import { AssignTypesService } from '../assigne-type/assigne-type.service';
import { FarrowingsService } from '../farrowings/farrowings.service';
import { UserAuthGuard } from '../users/middleware';
import { CreateOrUpdateWeaningsDto, WeaningDto } from './weaning.dto';
import { WeaningsService } from './weaning.service';

@Controller('weanings')
export class WeaningsController {
  constructor(
    private readonly weaningsService: WeaningsService,
    private readonly animalsService: AnimalsService,
    private readonly farrowingsService: FarrowingsService,
    private readonly assignTypesService: AssignTypesService,
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
    const { animalTypeId } = queryWeaning;

    const { take, page, sort } = requestPaginationDto;
    const pagination: PaginationType = addPagination({ page, take, sort });

    const weanings = await this.weaningsService.findAll({
      search,
      pagination,
      animalTypeId,
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
    const { litter, date, note, codeFemale, farrowingId, animalTypeId } = body;

    const findOneAssignType = await this.assignTypesService.findOneBy({
      animalTypeId,
      organizationId: user.organizationId,
    });
    if (!findOneAssignType)
      throw new HttpException(
        `AnimalType not assigned please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneFemale = await this.animalsService.findOneBy({
      code: codeFemale,
      gender: 'FEMALE',
      status: 'ACTIVE',
      productionPhase: 'LACTATION',
      animalTypeId: findOneAssignType.animalTypeId,
      organizationId: user.organizationId,
    });
    if (!findOneFemale)
      throw new HttpException(
        `Female animal ${codeFemale} doesn't exists, isn't in LACTATION phase  or isn't ACTIVE please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneFarrowing = await this.farrowingsService.findOneBy({
      farrowingId,
      organizationId: user.organizationId,
    });
    if (!findOneFarrowing)
      throw new HttpException(
        `FarrowingId: ${farrowingId} doesn't exists, please change`,
        HttpStatus.NOT_FOUND,
      );

    if (litter > findOneFarrowing.litter)
      throw new HttpException(
        `Weaning litter: ${litter} can't be greater than farrowing litter: ${findOneFarrowing.litter}`,
        HttpStatus.AMBIGUOUS,
      );

    const weaning = await this.weaningsService.createOne({
      note,
      date,
      litter,
      animalId: findOneFemale.id,
      farrowingId: findOneFarrowing.id,
      animalTypeId: findOneAssignType.animalTypeId,
      organizationId: user.organizationId,
      userCreatedId: user.id,
    });

    await this.activitylogsService.createOne({
      userId: user.id,
      date: new Date(),
      actionId: weaning.id,
      message: `${user.profile?.firstName} ${user.profile?.lastName} created a weaning in ${findOneAssignType.animalType.name}`,
      organizationId: user.organizationId,
    });

    await this.animalsService.updateOne(
      { animalId: findOneFemale.id },
      { productionPhase: 'REPRODUCTION' },
    );

    return reply({ res, results: weaning });
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
    const { litter, date, note, codeFemale, farrowingId, animalTypeId } = body;

    const findOneAssignType = await this.assignTypesService.findOneBy({
      animalTypeId,
      organizationId: user.organizationId,
    });
    if (!findOneAssignType)
      throw new HttpException(
        `AnimalType not assigned please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneWeaning = await this.weaningsService.findOneBy({
      weaningId,
      animalTypeId: findOneAssignType.animalTypeId,
      organizationId: user.organizationId,
    });
    if (!findOneWeaning)
      throw new HttpException(
        `WeaningId: ${weaningId} doesn't exists, please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneFemale = await this.animalsService.findOneBy({
      code: codeFemale,
      gender: 'FEMALE',
      status: 'ACTIVE',
      productionPhase: 'LACTATION',
      organizationId: user.organizationId,
    });
    if (!findOneFemale)
      throw new HttpException(
        `Female animal ${codeFemale} doesn't exists, isn't in LACTATION phase  or isn't ACTIVE please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneFarrowing = await this.farrowingsService.findOneBy({
      farrowingId,
      organizationId: user.organizationId,
    });
    if (!findOneFarrowing)
      throw new HttpException(
        `FarrowingId: ${farrowingId} doesn't exists, please change`,
        HttpStatus.NOT_FOUND,
      );

    const weaning = await this.weaningsService.updateOne(
      { weaningId: findOneWeaning.id },
      {
        note,
        date,
        litter,
        animalId: findOneFemale.id,
        farrowingId: findOneFarrowing.id,
        userCreatedId: user.id,
      },
    );

    await this.activitylogsService.createOne({
      userId: user.id,
      date: new Date(),
      actionId: weaning.id,
      message: `${user.profile?.firstName} ${user.profile?.lastName} updated a weaning in ${findOneAssignType.animalType.name}`,
      organizationId: user.organizationId,
    });

    return reply({ res, results: weaning });
  }

  /** Get one Weaning */
  @Get(`/view/:weaningId`)
  @UseGuards(UserAuthGuard)
  async getOneByIdWeaning(
    @Res() res,
    @Req() req,
    @Param('weaningId', ParseUUIDPipe) weaningId: string,
  ) {
    const { user } = req;

    const findOneWeaning = await this.weaningsService.findOneBy({
      weaningId,
      organizationId: user.organizationId,
    });
    if (!findOneWeaning)
      throw new HttpException(
        `WeaningId: ${weaningId} doesn't exists, please change`,
        HttpStatus.NOT_FOUND,
      );

    return reply({ res, results: findOneWeaning });
  }

  /** Delete Weaning */
  @Delete(`/delete/:weaningId`)
  @UseGuards(UserAuthGuard)
  async deleteOne(
    @Res() res,
    @Req() req,
    @Param('weaningId', ParseUUIDPipe) weaningId: string,
  ) {
    const { user } = req;

    const findOneWeaning = await this.weaningsService.findOneBy({
      weaningId,
      organizationId: user.organizationId,
    });
    if (!findOneWeaning)
      throw new HttpException(
        `WeaningId: ${weaningId} doesn't exists, please change`,
        HttpStatus.NOT_FOUND,
      );

    await this.activitylogsService.createOne({
      userId: user.id,
      date: new Date(),
      message: `${user.profile?.firstName} ${user.profile?.lastName} deleted a weaning in ${findOneWeaning.animalType.name}`,
      organizationId: user.organizationId,
    });

    await this.weaningsService.updateOne(
      { weaningId: findOneWeaning.id },
      { deletedAt: new Date() },
    );

    return reply({ res, results: 'Weaning deleted successfully' });
  }
}
