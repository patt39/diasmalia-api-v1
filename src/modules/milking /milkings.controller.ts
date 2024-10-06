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
    private readonly activitylogsService: ActivityLogsService,
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
    const { animalTypeId } = queryMethod;

    const { take, page, sort, sortBy } = requestPaginationDto;
    const pagination: PaginationType = addPagination({
      page,
      take,
      sort,
      sortBy,
    });

    const milkings = await this.milkingsService.findAll({
      search,
      pagination,
      animalTypeId,
      organizationId: user?.organizationId,
    });

    return reply({ res, results: milkings });
  }

  /** Post  Bulk milking */
  @Post(`/bulk/create`)
  @UseGuards(UserAuthGuard)
  async createOneBulk(@Res() res, @Req() req, @Body() body: BulkMilkingsDto) {
    const { user } = req;
    const { quantity, animals, note } = body;

    for (const animal of animals) {
      const findOneFemale = await this.animalsService.findOneBy({
        status: 'ACTIVE',
        code: animal,
        gender: 'FEMALE',
        isIsolated: 'NO',
        productionPhase: 'LACTATION',
      });
      if (!findOneFemale)
        throw new HttpException(
          `Animal ${animal} doesn't exists please change`,
          HttpStatus.NOT_FOUND,
        );

      await this.milkingsService.createOne({
        note,
        quantity,
        animalId: findOneFemale?.id,
        animalTypeId: findOneFemale?.animalTypeId,
        organizationId: user?.organizationId,
        userCreatedId: user?.id,
      });

      await this.activitylogsService.createOne({
        userId: user?.id,
        organizationId: user?.organizationId,
        message: `${user?.profile?.firstName} ${user?.profile?.lastName} milked ${animals?.lenght} in ${findOneFemale?.animalType?.name}`,
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
    const { quantity, femaleCode } = body;

    const findOneMilking = await this.milkingsService.findOneBy({
      milkingId,
      organizationId: user?.organizationId,
    });
    if (!findOneMilking)
      throw new HttpException(
        `MilkingId: ${milkingId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneFemale = await this.animalsService.findOneBy({
      status: 'ACTIVE',
      code: femaleCode,
      gender: 'FEMALE',
      isIsolated: 'NO',
      productionPhase: 'LACTATION',
    });
    if (!findOneFemale)
      throw new HttpException(
        `Animal ${findOneFemale?.code} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    await this.milkingsService.updateOne(
      { milkingId: findOneMilking?.id },
      {
        quantity,
        animalId: findOneFemale?.id,
        userCreatedId: user?.id,
      },
    );

    await this.activitylogsService.createOne({
      userId: user?.id,
      organizationId: user?.organizationId,
      message: `${user?.profile?.firstName} ${user?.profile?.lastName} updated a feeding in ${findOneMilking?.animalType?.name} for ${findOneMilking?.animal?.code}`,
    });

    return reply({ res, results: 'Milking Created Successfully' });
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

    const findOneMilking = await this.milkingsService.findOneBy({
      milkingId,
      organizationId: user?.organizationId,
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

    await this.activitylogsService.createOne({
      userId: user?.id,
      organizationId: user?.organizationId,
      message: `${user?.profile?.firstName} ${user?.profile?.lastName} deleted a milking in ${findOneMilking?.animalType?.name}`,
    });

    return reply({ res, results: 'Milking deleted successfully' });
  }
}
