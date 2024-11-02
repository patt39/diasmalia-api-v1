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
import { UserAuthGuard } from '../users/middleware';
import { CreateCagesDto } from './cages.dto';
import { CagesService } from './cages.service';

@Controller('cages')
export class CagesController {
  constructor(
    private readonly cagesService: CagesService,
    private readonly animalsService: AnimalsService,
    private readonly activitylogsService: ActivityLogsService,
  ) {}

  /** Get all Cages */
  @Get(`/`)
  async findAll(
    @Res() res,
    @Query() requestPaginationDto: RequestPaginationDto,
    @Query() searchQuery: SearchQueryDto,
  ) {
    const { search } = searchQuery;

    const { take, page, sort, sortBy } = requestPaginationDto;
    const pagination: PaginationType = addPagination({
      page,
      take,
      sort,
      sortBy,
    });

    const cages = await this.cagesService.findAll({
      search,
      pagination,
    });

    return reply({ res, results: cages });
  }

  /** Post one Cage */
  @Post(`/`)
  @UseGuards(UserAuthGuard)
  async createOne(@Res() res, @Req() req, @Body() body: CreateCagesDto) {
    const { user } = req;
    const { code, dimension, animalsPerCage } = body;

    const findOneAnimal = await this.animalsService.findOneBy({
      code,
      organizationId: user?.organizationId,
    });
    if (!findOneAnimal)
      throw new HttpException(
        `Animal code: ${findOneAnimal?.code} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const appInitials = config.datasite.name.substring(0, 1).toUpperCase();
    const orgInitials = user.organization.name.substring(0, 1).toUpperCase();
    const newAnimalArray: any = [];

    if (findOneAnimal?.quantity && findOneAnimal?.location?.cages !== 0) {
      for (let i = 0; i < findOneAnimal?.location?.cages; i++) {
        const cage = await this.cagesService.createOne({
          dimension,
          number: animalsPerCage,
          userCreatedId: user?.id,
          animalId: findOneAnimal?.id,
          code: `${orgInitials}${generateNumber(2)}${appInitials}`,
          animalTypeId: findOneAnimal?.animalTypeId,
          organizationId: user?.organizationId,
        });

        newAnimalArray.push(cage);

        await this.activitylogsService.createOne({
          userId: user?.id,
          message: `${user?.profile?.firstName} ${user?.profile?.lastName} added  ${animalsPerCage} in cages ${findOneAnimal?.animalType?.name}`,
          organizationId: user?.organizationId,
        });
      }
    }

    return reply({ res, results: 'Cages created successfully' });
  }

  /** Get one cage */
  @Get(`/:cageId/view`)
  @UseGuards(UserAuthGuard)
  async viewCage(@Res() res, @Param('cageId', ParseUUIDPipe) cageId: string) {
    const cage = await this.cagesService.findOneBy({ cageId });

    return reply({ res, results: cage });
  }

  /** Delete one Cage */
  @Delete(`/:cageId/delete`)
  @UseGuards(UserAuthGuard)
  async deleteOne(@Res() res, @Param('cageId', ParseUUIDPipe) cageId: string) {
    const cage = await this.cagesService.updateOne(
      { cageId },
      { deletedAt: new Date() },
    );

    return reply({ res, results: cage });
  }
}
