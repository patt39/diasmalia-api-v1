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
  BulkFatteningsDto,
  CreateOrUpdateFatteningsDto,
  GetCastrationsQueryDto,
} from './fattening.dto';
import { FatteningsService } from './fattening.service';

@Controller('fattenings')
export class FatteningsController {
  constructor(
    private readonly animalsService: AnimalsService,
    private readonly fatteningsService: FatteningsService,
    private readonly activitylogsService: ActivityLogsService,
  ) {}

  /** Get all fattenings */
  @Get(`/`)
  @UseGuards(UserAuthGuard)
  async findAll(
    @Res() res,
    @Req() req,
    @Query() requestPaginationDto: RequestPaginationDto,
    @Query() query: SearchQueryDto,
    @Query() queryCastration: GetCastrationsQueryDto,
  ) {
    const { user } = req;
    const { search } = query;
    const { animalTypeId } = queryCastration;

    const { take, page, sort, sortBy } = requestPaginationDto;
    const pagination: PaginationType = addPagination({
      page,
      take,
      sort,
      sortBy,
    });

    const fattenings = await this.fatteningsService.findAll({
      search,
      pagination,
      animalTypeId,
      organizationId: user.organizationId,
    });

    return reply({ res, results: fattenings });
  }

  /** Post one Bulk fattening */
  @Post(`/bulk/create`)
  @UseGuards(UserAuthGuard)
  async createOneBulk(@Res() res, @Req() req, @Body() body: BulkFatteningsDto) {
    const { user } = req;
    const { animals } = body;

    for (const animal of animals) {
      const findOneAnimal = await this.animalsService.findOneBy({
        status: 'ACTIVE',
        code: animal.code,
      });
      if (!findOneAnimal)
        throw new HttpException(
          `Animal ${animal.code} doesn't exists please change`,
          HttpStatus.NOT_FOUND,
        );

      const findOneFattening = await this.fatteningsService.findOneBy({
        animalId: findOneAnimal.id,
      });
      if (!findOneFattening) {
        await this.fatteningsService.createOne({
          initialWeight: findOneAnimal.weight,
          animalId: findOneAnimal.id,
          animalTypeId: findOneAnimal.animalTypeId,
          organizationId: user.organizationId,
          userCreatedId: user.id,
        });
      } else {
        throw new HttpException(
          `Animals already in fattening`,
          HttpStatus.NOT_FOUND,
        );
      }

      await this.animalsService.updateOne(
        { animalId: findOneAnimal.id },
        { productionPhase: 'FATTENING' },
      );

      await this.activitylogsService.createOne({
        userId: user.id,
        organizationId: user.organizationId,
        message: `${user.profile?.firstName} ${user.profile?.lastName} put animals: ${animals} in ${findOneAnimal.animalType.name} in fattening`,
      });
    }

    return reply({ res, results: 'Saved' });
  }

  /** Update one fattening */
  @Put(`/:fatteningId/edit`)
  @UseGuards(UserAuthGuard)
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateFatteningsDto,
    @Param('fatteningId', ParseUUIDPipe) fatteningId: string,
  ) {
    const { user } = req;
    const { actualWeight } = body;

    const findOneFattening = await this.fatteningsService.findOneBy({
      fatteningId,
      organizationId: user.organizationId,
    });
    if (!findOneFattening)
      throw new HttpException(
        `FatteningId: ${fatteningId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const fattening = await this.fatteningsService.updateOne(
      { fatteningId: findOneFattening?.id },
      {
        actualWeight,
        updatedAt: new Date(),
        userCreatedId: user.id,
      },
    );

    await this.activitylogsService.createOne({
      userId: user.id,
      organizationId: user.organizationId,
      message: `${user.profile?.firstName} ${user.profile?.lastName} updated a fattening in ${findOneFattening.animalType.name} for ${findOneFattening.animal.code}`,
    });

    return reply({ res, results: fattening });
  }

  /** Delete one fattening */
  @Delete(`/:fatteningId/delete`)
  @UseGuards(UserAuthGuard)
  async deleteOne(
    @Res() res,
    @Req() req,
    @Param('fatteningId', ParseUUIDPipe) fatteningId: string,
  ) {
    const { user } = req;

    const findOneFattening = await this.fatteningsService.findOneBy({
      fatteningId,
      organizationId: user?.organizationId,
    });
    if (!findOneFattening)
      throw new HttpException(
        `FatteningId: ${fatteningId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    await this.fatteningsService.updateOne(
      { fatteningId: findOneFattening?.id },
      { deletedAt: new Date() },
    );

    await this.activitylogsService.createOne({
      userId: user?.id,
      organizationId: user?.organizationId,
      message: `${user.profile?.firstName} ${user.profile?.lastName} deleted a castration`,
    });

    return reply({ res, results: 'Castration deleted successfully' });
  }
}
