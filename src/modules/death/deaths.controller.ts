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
import { RequestPaginationDto } from '../../app/utils/pagination/request-pagination.dto';
import {
  PaginationType,
  addPagination,
} from '../../app/utils/pagination/with-pagination';
import { reply } from '../../app/utils/reply';
import { SearchQueryDto } from '../../app/utils/search-query/search-query.dto';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { AnimalsService } from '../animals/animals.service';
import { IsolationsService } from '../isolations/isolations.service';
import { LocationsService } from '../locations/locations.service';
import { UserAuthGuard } from '../users/middleware';
import {
  BulkDeathsDto,
  CreateDeathsDto,
  DeathQueryDto,
  UpdateDeathsDto,
} from './deaths.dto';
import { DeathsService } from './deaths.service';

@Controller('deaths')
export class DeathsController {
  constructor(
    private readonly deathsService: DeathsService,
    private readonly animalsService: AnimalsService,
    private readonly locationsService: LocationsService,
    private readonly isolationsService: IsolationsService,
    private readonly activitylogsService: ActivityLogsService,
  ) {}

  /** Get all deaths */
  @Get(`/`)
  @UseGuards(UserAuthGuard)
  async findAll(
    @Res() res,
    @Req() req,
    @Query() requestPaginationDto: RequestPaginationDto,
    @Query() query: SearchQueryDto,
    @Query() queryDeath: DeathQueryDto,
  ) {
    const { user } = req;
    const { search } = query;
    const { animalTypeId, periode } = queryDeath;

    const { take, page, sort, sortBy } = requestPaginationDto;
    const pagination: PaginationType = addPagination({
      page,
      take,
      sort,
      sortBy,
    });

    const deaths = await this.deathsService.findAll({
      search,
      pagination,
      animalTypeId,
      periode: Number(periode),
      organizationId: user?.organizationId,
    });

    return reply({ res, results: deaths });
  }

  /** Post one aves death */
  @Post(`/create/aves`)
  @UseGuards(UserAuthGuard)
  async createOne(@Res() res, @Req() req, @Body() body: CreateDeathsDto) {
    const { user } = req;
    const { code, number, female, male, note } = body;

    const findOneAnimal = await this.animalsService.findOneByCode({
      code,
      status: 'ACTIVE',
      organizationId: user?.organizationId,
    });
    if (!findOneAnimal)
      throw new HttpException(
        `Animal ${code} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    if (findOneAnimal?.quantity === 0)
      throw new HttpException(
        `Band: ${code} is empty please change`,
        HttpStatus.NOT_FOUND,
      );

    if (
      findOneAnimal?.quantity < number ||
      findOneAnimal?.female < female ||
      findOneAnimal?.male < male
    )
      throw new HttpException(
        `Impossible to create insuficient animals available`,
        HttpStatus.NOT_FOUND,
      );

    const sumDeaths = Number(female + male);

    const death = await this.deathsService.createOne({
      note,
      male: male,
      female: female,
      animalId: findOneAnimal?.id,
      number: number ? number : sumDeaths,
      animalTypeId: findOneAnimal?.animalTypeId,
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
    });

    const findOneIsolation = await this.isolationsService.findOneBy({
      animalId: findOneAnimal?.id,
      organizationId: user?.organizationId,
    });
    if (!findOneAnimal)
      throw new HttpException(
        `Animal ${code} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    if (findOneIsolation) {
      await this.isolationsService.updateOne(
        { isolationId: findOneIsolation?.id },
        { number: findOneIsolation?.number - death?.number },
      );
    }
    const allDeath = Number(findOneIsolation?.number - death?.number);

    if (allDeath === 0) {
      await this.isolationsService.updateOne(
        { isolationId: findOneIsolation?.id },
        { deletedAt: new Date() },
      );
    }

    await this.animalsService.updateOne(
      { animalId: findOneAnimal?.id },
      {
        male: findOneAnimal?.male - male,
        female: findOneAnimal?.female - female,
        quantity: findOneAnimal?.quantity - death?.number,
      },
    );

    if (
      findOneAnimal?.quantity - death?.number === 0 &&
      findOneAnimal?._count?.sales === 0
    ) {
      await this.animalsService.updateOne(
        { animalId: findOneAnimal?.id },
        { status: 'DEAD' },
      );
      await this.locationsService.updateOne(
        { locationId: findOneAnimal?.locationId },
        { status: true },
      );
    }

    await this.activitylogsService.createOne({
      userId: user?.id,
      message: `${user?.profile?.firstName} ${user?.profile?.lastName} added dead animals in ${findOneAnimal?.animalType.name} for ${findOneAnimal?.code} `,
      organizationId: user?.organizationId,
    });

    return reply({
      res,
      results: {
        status: HttpStatus.CREATED,
        data: death,
        message: `Death Created Successfully`,
      },
    });
  }

  /** Post one Bulk death */
  @Post(`/bulk/create`)
  @UseGuards(UserAuthGuard)
  async createOneBulk(@Res() res, @Req() req, @Body() body: BulkDeathsDto) {
    const { user } = req;
    const { animals, note } = body;

    for (const animal of animals) {
      const findOneAnimal = await this.animalsService.findOneBy({
        code: animal,
      });

      const death = await this.deathsService.createOne({
        note,
        animalId: findOneAnimal?.id,
        organizationId: user?.organizationId,
        animalTypeId: findOneAnimal?.animalTypeId,
        userCreatedId: user?.id,
      });

      await this.animalsService.updateOne(
        { animalId: death?.animalId },
        { status: 'DEAD' },
      );

      await this.activitylogsService.createOne({
        userId: user?.id,
        organizationId: user?.organizationId,
        message: `${user?.profile?.firstName} ${user?.profile?.lastName} added dead animals for ${findOneAnimal?.code} in ${findOneAnimal?.animalType?.name}`,
      });
    }

    return reply({ res, results: 'Saved' });
  }

  /** Get one Death */
  @Get(`/:animalId/show`)
  @UseGuards(UserAuthGuard)
  async getOneDeathByAnimalId(
    @Res() res,
    @Req() req,
    @Param('animalId', ParseUUIDPipe) animalId: string,
  ) {
    const { user } = req;

    const findOneDeadAnimal = await this.deathsService.findOneBy({
      animalId,
      organizationId: user?.organizationId,
    });
    if (!findOneDeadAnimal)
      throw new HttpException(
        `AnimalId: ${animalId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    return reply({ res, results: findOneDeadAnimal });
  }

  /** Get one Death */
  @Get(`/:deathId/view`)
  @UseGuards(UserAuthGuard)
  async getOneByIdDeath(
    @Res() res,
    @Req() req,
    @Param('deathId', ParseUUIDPipe) deathId: string,
  ) {
    const { user } = req;

    const findOneDeadAnimal = await this.deathsService.findOneBy({
      deathId,
      organizationId: user.organizationId,
    });
    if (!findOneDeadAnimal)
      throw new HttpException(
        `DeathId: ${deathId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    return reply({ res, results: findOneDeadAnimal });
  }

  /** Update one death */
  @Put(`/:deathId/edit`)
  @UseGuards(UserAuthGuard)
  async updateOneDeath(
    @Res() res,
    @Req() req,
    @Body() body: UpdateDeathsDto,
    @Param('deathId', ParseUUIDPipe) deathId: string,
  ) {
    const { user } = req;
    const { note } = body;

    const findOneDeath = await this.deathsService.findOneBy({
      deathId,
      organizationId: user.organizationId,
    });
    if (!findOneDeath)
      throw new HttpException(
        `DeathId: ${deathId} please change`,
        HttpStatus.NOT_FOUND,
      );

    await this.deathsService.updateOne(
      { deathId: findOneDeath?.id },
      {
        note,
        userCreatedId: user?.id,
      },
    );

    await this.activitylogsService.createOne({
      userId: user?.id,
      organizationId: user?.organizationId,
      message: `${user?.profile?.firstName} ${user?.profile?.lastName} updated ${findOneDeath?.animal?.code} dead in ${findOneDeath?.animalType?.name}`,
    });

    return reply({ res, results: 'Death updated successfully' });
  }

  /** Delete one Death */
  @Delete(`/:deathId/delete`)
  @UseGuards(UserAuthGuard)
  async deleteOne(
    @Res() res,
    @Req() req,
    @Param('deathId', ParseUUIDPipe) deathId: string,
  ) {
    const { user } = req;

    const findOneDead = await this.deathsService.findOneBy({
      deathId,
      organizationId: user?.organizationId,
    });
    if (!findOneDead)
      throw new HttpException(
        `DeathId: ${deathId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const death = await this.deathsService.updateOne(
      { deathId: findOneDead?.id },
      { deletedAt: new Date() },
    );

    await this.animalsService.updateOne(
      { animalId: findOneDead?.animalId },
      { status: 'ACTIVE' },
    );

    await this.animalsService.updateOne(
      { animalId: findOneDead?.animalId },
      {
        quantity: findOneDead?.animal?.quantity + findOneDead?.number,
        female: findOneDead?.animal?.female + findOneDead?.female,
        male: findOneDead?.animal?.male + findOneDead?.male,
      },
    );

    await this.activitylogsService.createOne({
      userId: user?.id,
      organizationId: user?.organizationId,
      message: `${user?.profile?.firstName} ${user?.profile?.lastName} deleted dead in ${findOneDead?.animal?.code} for ${findOneDead?.animalType?.name}`,
    });

    return reply({ res, results: death });
  }
}
