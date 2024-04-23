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
import { AnimalsService } from '../animals/animals.service';
import { AssignTypesService } from '../assigne-type/assigne-type.service';
import { UserAuthGuard } from '../users/middleware';
import {
  BulkMilkingsDto,
  CreateOrUpdateMilkingsDto,
  GetMilkingsQueryDto,
} from './milkings.dto';
import { MilkingsService } from './milkings.service';

@Controller('milkings')
export class MilkingsController {
  constructor(
    private readonly milkingsService: MilkingsService,
    private readonly animalsService: AnimalsService,
    private readonly assignTypesService: AssignTypesService,
  ) {}

  /** Get all milkings */
  @Get(`/`)
  @UseGuards(UserAuthGuard)
  async findAll(
    @Res() res,
    @Req() req,
    @Query() requestPaginationDto: RequestPaginationDto,
    @Query() query: SearchQueryDto,
    @Query() queryMethod: GetMilkingsQueryDto,
  ) {
    const { user } = req;
    const { search } = query;
    const { method, animalTypeId } = queryMethod;

    const { take, page, sort } = requestPaginationDto;
    const pagination: PaginationType = addPagination({ page, take, sort });

    const milkings = await this.milkingsService.findAll({
      search,
      method,
      pagination,
      animalTypeId,
      organizationId: user?.organizationId,
    });

    return reply({ res, results: milkings });
  }

  /** Post one milking */
  @Post(`/create`)
  @UseGuards(UserAuthGuard)
  async createOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateMilkingsDto,
  ) {
    const { user } = req;
    const { note, date, quantity, method, femaleCode } = body;

    const findOneFemale = await this.animalsService.findOneBy({
      code: femaleCode,
      gender: 'FEMALE',
      status: 'ACTIVE',
      isIsolated: 'FALSE',
      productionPhase: 'LACTATION',
    });
    if (!findOneFemale)
      throw new HttpException(
        `Animal ${femaleCode} doesn't exists, isn't in LACTATION phase, isn't a FEMALE or isn't ACTIVE please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneAssignType = await this.assignTypesService.findOneBy({
      status: true,
      organizationId: user?.organizationId,
    });
    if (!findOneAssignType)
      throw new HttpException(
        `AnimalType not assigned please change`,
        HttpStatus.NOT_FOUND,
      );

    const milking = await this.milkingsService.createOne({
      note,
      date,
      method,
      quantity,
      animalId: findOneFemale.id,
      animalTypeId: findOneAssignType.animalTypeId,
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
    });

    return reply({ res, results: milking });
  }

  /** Post one Bulk milking */
  @Post(`/bulk/create`)
  @UseGuards(UserAuthGuard)
  async createOneBulk(@Res() res, @Req() req, @Body() body: BulkMilkingsDto) {
    const { user } = req;
    const { date, method, quantity, animals, note } = body;

    const findOneAssignType = await this.assignTypesService.findOneBy({
      status: true,
      organizationId: user?.organizationId,
    });
    if (!findOneAssignType)
      throw new HttpException(
        `AnimalType not assigned please change`,
        HttpStatus.NOT_FOUND,
      );

    for (const animal of animals) {
      const findOneFemale = await this.animalsService.findOneBy({
        status: 'ACTIVE',
        code: animal?.code,
        gender: 'FEMALE',
        isIsolated: 'FALSE',
        productionPhase: 'LACTATION',
      });
      if (!findOneFemale)
        throw new HttpException(
          `Animal ${findOneFemale?.code} doesn't exists please change`,
          HttpStatus.NOT_FOUND,
        );

      await this.milkingsService.createOne({
        note,
        date,
        method,
        quantity,
        animalId: findOneFemale?.id,
        animalTypeId: findOneAssignType.animalTypeId,
        organizationId: user?.organizationId,
        userCreatedId: user?.id,
      });
    }

    return reply({ res, results: 'Saved' });
  }

  /** Update one milking */
  @Put(`/:milkingId/edit`)
  @UseGuards(UserAuthGuard)
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateMilkingsDto,
    @Param('milkingId', ParseUUIDPipe) milkingId: string,
  ) {
    const { user } = req;
    const { note, date, quantity, method, femaleCode } = body;

    const findOneAssignType = await this.assignTypesService.findOneBy({
      status: true,
      organizationId: user?.organizationId,
    });
    if (!findOneAssignType)
      throw new HttpException(
        `AnimalType not assigned please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneMilking = await this.milkingsService.findOneBy({
      milkingId,
      animalTypeId: findOneAssignType.animalTypeId,
    });
    if (!findOneMilking)
      throw new HttpException(
        `MilkingId: ${milkingId} doesn't exists, please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneFemale = await this.animalsService.findOneBy({
      code: femaleCode,
      gender: 'FEMALE',
      status: 'ACTIVE',
      isIsolated: 'FALSE',
      productionPhase: 'LACTATION',
    });
    if (!findOneFemale)
      throw new HttpException(
        `Animal ${femaleCode} doesn't exists, isn't in LACTATION phase, isn't a FEMALE or isn't ACTIVE please change`,
        HttpStatus.NOT_FOUND,
      );

    const milking = await this.milkingsService.updateOne(
      { milkingId: findOneMilking?.id },
      {
        note,
        date,
        method,
        quantity,
        animalId: findOneFemale?.id,
        organizationId: user?.organizationId,
        userCreatedId: user?.id,
      },
    );

    return reply({ res, results: milking });
  }

  /** Get one milking */
  @Get(`/view`)
  @UseGuards(UserAuthGuard)
  async getOneByIdMilking(
    @Res() res,
    @Req() req,
    @Query('milkingId', ParseUUIDPipe) milkingId: string,
  ) {
    const { user } = req;
    const findOneAssignType = await this.assignTypesService.findOneBy({
      status: true,
      organizationId: user?.organizationId,
    });
    if (!findOneAssignType)
      throw new HttpException(
        `AnimalType not assigned please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneMilking = await this.milkingsService.findOneBy({
      milkingId,
      animalTypeId: findOneAssignType.animalTypeId,
    });
    if (!findOneMilking)
      throw new HttpException(
        `MilkingId: ${milkingId} doesn't exists, please change`,
        HttpStatus.NOT_FOUND,
      );

    return reply({ res, results: findOneMilking });
  }

  /** Delete one milking */
  @Delete(`/delete/:milkingId`)
  @UseGuards(UserAuthGuard)
  async deleteOne(
    @Res() res,
    @Req() req,
    @Param('milkingId', ParseUUIDPipe) milkingId: string,
  ) {
    const { user } = req;

    const findOneAssignType = await this.assignTypesService.findOneBy({
      status: true,
      organizationId: user?.organizationId,
    });
    if (!findOneAssignType)
      throw new HttpException(
        `AnimalType not assigned please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneMilking = await this.milkingsService.findOneBy({
      milkingId,
      animalTypeId: findOneAssignType.animalTypeId,
    });
    if (!findOneMilking)
      throw new HttpException(
        `MilkingId: ${milkingId} doesn't exists, please change`,
        HttpStatus.NOT_FOUND,
      );

    await this.milkingsService.updateOne(
      { milkingId: findOneMilking?.id },
      { deletedAt: new Date() },
    );

    return reply({ res, results: 'Milking deleted successfully' });
  }
}
