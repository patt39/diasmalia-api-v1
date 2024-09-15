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
      organizationId: user.organizationId,
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

    const sumDeadAnimals = male + female;

    if (
      findOneAnimal?.quantity < number ||
      findOneAnimal?.quantity < sumDeadAnimals
    )
      throw new HttpException(
        `Impossible to create insuficient animals available`,
        HttpStatus.NOT_FOUND,
      );

    const death = await this.deathsService.createOne({
      note,
      animalId: findOneAnimal?.id,
      number: number ? number : sumDeadAnimals,
      animalTypeId: findOneAnimal?.animalTypeId,
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
    });

    await this.animalsService.updateOne(
      { animalId: findOneAnimal?.id },
      {
        female: findOneAnimal?.female - female,
        male: findOneAnimal?.male - male,
        quantity: findOneAnimal?.quantity - death?.number,
      },
    );

    if (findOneAnimal?.quantity - death?.number === 0) {
      await this.animalsService.updateOne(
        { animalId: findOneAnimal?.id },
        { status: 'DEAD' },
      );
    }
    console.log('findOneAnimalDead ==>', findOneAnimal?.quantity);

    await this.activitylogsService.createOne({
      userId: user.id,
      message: `${user.profile?.firstName} ${user.profile?.lastName} added a dead ${findOneAnimal.animalType.name} with code ${findOneAnimal?.code} `,
      organizationId: user.organizationId,
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
        message: `${user?.profile?.firstName} ${user?.profile?.lastName} created a death for ${animals?.lenght} ${findOneAnimal?.animalType?.name}`,
      });
    }

    return reply({ res, results: 'Saved' });
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
    const { note, number, female, male } = body;

    const findOneDeath = await this.deathsService.findOneBy({
      deathId,
      organizationId: user.organizationId,
    });
    if (!findOneDeath)
      throw new HttpException(
        `DeathId: ${deathId} please change`,
        HttpStatus.NOT_FOUND,
      );

    const sumAnimals = Number(male + female);

    await this.deathsService.updateOne(
      { deathId: findOneDeath?.id },
      {
        note,
        number: number ? number : sumAnimals,
        userCreatedId: user?.id,
      },
    );

    await this.animalsService.updateOne(
      { animalId: findOneDeath?.animalId },
      {
        quantity: findOneDeath?.animal?.quantity - number,
        female: findOneDeath?.animal?.female - female,
        male: findOneDeath?.animal?.male - male,
      },
    );

    await this.activitylogsService.createOne({
      userId: user?.id,
      organizationId: user?.organizationId,
      message: `${user?.profile?.firstName} ${user.profile?.lastName} updated a death in ${findOneDeath?.animalType?.name} dead`,
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
      organizationId: user.organizationId,
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
      { quantity: findOneDead?.animal?.quantity + findOneDead?.number },
    );

    await this.activitylogsService.createOne({
      userId: user.id,
      organizationId: user.organizationId,
      message: `${user.profile?.firstName} ${user.profile?.lastName} deleted ${findOneDead.animal.code} in ${findOneDead.animalType.name} dead`,
    });

    return reply({ res, results: death });
  }
}
