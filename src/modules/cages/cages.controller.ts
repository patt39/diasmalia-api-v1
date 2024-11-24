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

import { config } from '../../app/config/index';
import { generateNumber } from '../../app/utils/commons';
import { RequestPaginationDto } from '../../app/utils/pagination/request-pagination.dto';
import {
  addPagination,
  PaginationType,
} from '../../app/utils/pagination/with-pagination';
import { SearchQueryDto } from '../../app/utils/search-query/search-query.dto';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { AnimalsService } from '../animals/animals.service';
import { EggHavestingsService } from '../egg-havesting/egg-havesting.service';
import { UserAuthGuard } from '../users/middleware';
import {
  CagesEggHarvestedDto,
  CreateOrUpdateCagesDto,
  GetCagesDto,
} from './cages.dto';
import { CagesService } from './cages.service';

@Controller('cages')
export class CagesController {
  constructor(
    private readonly cagesService: CagesService,
    private readonly animalsService: AnimalsService,
    private readonly eggHarvestingsService: EggHavestingsService,
    private readonly activitylogsService: ActivityLogsService,
  ) {}

  /** Get all Cages */
  @Get(`/`)
  async findAll(
    @Res() res,
    @Req() req,
    @Query() requestPaginationDto: RequestPaginationDto,
    @Query() searchQuery: SearchQueryDto,
    @Query() animalQuery: GetCagesDto,
  ) {
    const { search } = searchQuery;
    const { user } = req;
    const { animalId } = animalQuery;
    const { take, page, sort, sortBy } = requestPaginationDto;
    const pagination: PaginationType = addPagination({
      page,
      take,
      sort,
      sortBy,
    });

    const cages = await this.cagesService.findAll({
      search,
      animalId,
      pagination,
      organizationId: user?.organizationId,
    });

    return reply({ res, results: cages });
  }

  /** Post one Cage */
  @Post(`/create`)
  @UseGuards(UserAuthGuard)
  async createOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateCagesDto,
  ) {
    const { user } = req;
    const { code, dimension, numberPerCage, number } = body;

    const findOneAnimal = await this.animalsService.findOneBy({
      code,
      organizationId: user?.organizationId,
    });
    if (!findOneAnimal)
      throw new HttpException(
        `Animal code: ${findOneAnimal?.code} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const cagesAvailabe = Number(
      findOneAnimal?.location?.cages - findOneAnimal?._count?.cages,
    );

    if (number > cagesAvailabe)
      throw new HttpException(
        `Number of cages available < ${number} available ${cagesAvailabe}`,
        HttpStatus.NOT_FOUND,
      );

    if (number > findOneAnimal?.location?.cages)
      throw new HttpException(
        `Number of cages available < ${number} available ${findOneAnimal?.location?.cages}`,
        HttpStatus.NOT_FOUND,
      );

    if (findOneAnimal?._count?.cages === findOneAnimal?.location?.cages)
      throw new HttpException(
        `All cages already created`,
        HttpStatus.NOT_FOUND,
      );

    const cages = await this.cagesService.countAnimalsInCages({
      animalId: findOneAnimal?.id,
      animalTypeId: findOneAnimal?.animalTypeId,
      organizationId: findOneAnimal?.organizationId,
    });

    const animalsAvailabe = Number(
      findOneAnimal.quantity - cages?._sum?.numberPerCage,
    );

    if (cages?._sum?.numberPerCage === findOneAnimal.quantity)
      throw new HttpException(
        `All animals already in cages`,
        HttpStatus.NOT_FOUND,
      );

    if (cages?._sum?.numberPerCage + numberPerCage > findOneAnimal.quantity)
      throw new HttpException(
        `Too many animals animals availabe ${animalsAvailabe}`,
        HttpStatus.NOT_FOUND,
      );

    const appInitials = config.datasite.name.substring(0, 1).toUpperCase();
    const orgInitials = user.organization.name.substring(0, 1).toUpperCase();
    const newAnimalArray: any = [];

    if (findOneAnimal?.quantity && findOneAnimal?.location?.cages !== 0) {
      for (let i = 0; i < number; i++) {
        const cage = await this.cagesService.createOne({
          dimension,
          numberPerCage,
          userCreatedId: user?.id,
          animalId: findOneAnimal?.id,
          code: `${orgInitials}${generateNumber(2)}${appInitials}`,
          animalTypeId: findOneAnimal?.animalTypeId,
          organizationId: user?.organizationId,
        });

        newAnimalArray.push(cage);

        await this.activitylogsService.createOne({
          userId: user?.id,
          message: `${user?.profile?.firstName} ${user?.profile?.lastName} added  ${numberPerCage} in cages ${findOneAnimal?.animalType?.name}`,
          organizationId: user?.organizationId,
        });
      }
    }

    return reply({ res, results: 'Cages created successfully' });
  }

  /** Update one cage */
  @Put(`/:cageId/edit`)
  @UseGuards(UserAuthGuard)
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateCagesDto,
    @Param('cageId', ParseUUIDPipe) cageId: string,
  ) {
    const { user } = req;
    const { dimension, numberPerCage, code } = body;

    const getCage = await this.cagesService.findOneBy({
      cageId,
    });
    if (!getCage)
      throw new HttpException(
        `cageId: ${cageId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const cages = await this.cagesService.countAnimalsInCages({
      animalId: getCage?.animalId,
      animalTypeId: getCage?.animalTypeId,
      organizationId: getCage?.organizationId,
    });

    const animalsAvailabe = Number(
      getCage?.animal?.quantity - cages?._sum?.numberPerCage,
    );

    if (cages?._sum?.numberPerCage === getCage?.animal?.quantity)
      throw new HttpException(
        `All animals already in cages`,
        HttpStatus.NOT_FOUND,
      );

    if (cages?._sum?.numberPerCage + numberPerCage > getCage?.animal?.quantity)
      throw new HttpException(
        `Too many animals animals availabe ${animalsAvailabe}`,
        HttpStatus.NOT_FOUND,
      );

    const cage = await this.cagesService.updateOne(
      { cageId: getCage?.id },
      { dimension, numberPerCage, code },
    );

    await this.activitylogsService.createOne({
      userId: user?.id,
      message: `${user?.profile?.firstName} ${user?.profile?.lastName} updated a cage in ${getCage?.animalType?.name}`,
      organizationId: user?.organizationId,
    });

    return reply({ res, results: cage });
  }

  /** Harvest egg in cage */
  @Put(`/:cageId/eggHarvest`)
  @UseGuards(UserAuthGuard)
  async eggHarvestCage(
    @Res() res,
    @Req() req,
    @Body() body: CagesEggHarvestedDto,
    @Param('cageId', ParseUUIDPipe) cageId: string,
  ) {
    const { user } = req;
    const { number, size } = body;

    const getCage = await this.cagesService.findOneBy({
      cageId,
      organizationId: user.organizationId,
    });
    if (!getCage)
      throw new HttpException(
        `cageId: ${cageId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const cage = await this.cagesService.updateOne(
      { cageId: getCage?.id },
      { eggHarvested: getCage?.eggHarvested + number },
    );

    await this.eggHarvestingsService.createOne({
      size: size,
      quantity: number,
      animalId: getCage?.animalId,
      animalTypeId: getCage?.animalTypeId,
      organizationId: getCage?.organizationId,
      userCreatedId: user?.id,
    });

    await this.activitylogsService.createOne({
      userId: user?.id,
      message: `${user?.profile?.firstName} ${user?.profile?.lastName} harvested eggs in cage  ${getCage?.code} for ${getCage?.animalType?.name}`,
      organizationId: user?.organizationId,
    });

    return reply({ res, results: cage });
  }

  /** Deads in cage */
  @Put(`/:cageId/dead`)
  @UseGuards(UserAuthGuard)
  async deadCage(
    @Res() res,
    @Req() req,
    @Body() body: CagesEggHarvestedDto,
    @Param('cageId', ParseUUIDPipe) cageId: string,
  ) {
    const { user } = req;
    const { number, size } = body;

    const getCage = await this.cagesService.findOneBy({
      cageId,
      organizationId: user.organizationId,
    });
    if (!getCage)
      throw new HttpException(
        `cageId: ${cageId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const cage = await this.cagesService.incrementNumber({
      cageId: getCage?.id,
      eggHarvested: number,
    });

    await this.eggHarvestingsService.createOne({
      size: size,
      quantity: number,
      animalId: getCage?.animalId,
      animalTypeId: getCage?.animalTypeId,
      organizationId: getCage?.organizationId,
      userCreatedId: user?.id,
    });

    await this.activitylogsService.createOne({
      userId: user?.id,
      message: `${user?.profile?.firstName} ${user?.profile?.lastName} harvested eggs in cage  ${getCage?.code} for ${getCage?.animalType?.name}`,
      organizationId: user?.organizationId,
    });

    return reply({ res, results: cage });
  }

  /** Delete one Cage */
  @Delete(`/:cageId/delete`)
  @UseGuards(UserAuthGuard)
  async deleteOne(
    @Res() res,
    @Req() req,
    @Param('cageId', ParseUUIDPipe) cageId: string,
  ) {
    const { user } = req;

    const getCage = await this.cagesService.findOneBy({
      cageId,
      organizationId: user.organizationId,
    });
    if (!getCage)
      throw new HttpException(
        `cageId: ${cageId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const cage = await this.cagesService.updateOne(
      { cageId: getCage?.id },
      { deletedAt: new Date() },
    );

    await this.activitylogsService.createOne({
      userId: user?.id,
      message: `${user?.profile?.firstName} ${user?.profile?.lastName} deleted a cage in ${getCage?.animalType?.name}`,
      organizationId: user?.organizationId,
    });

    return reply({ res, results: cage });
  }
}
