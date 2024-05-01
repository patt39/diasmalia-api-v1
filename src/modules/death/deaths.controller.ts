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
import { AssignTypesService } from '../assigne-type/assigne-type.service';
import { SalesService } from '../sales/sales.service';
import { UserAuthGuard } from '../users/middleware';
import {
  BulkDeathsDto,
  CreateOrUpdateDeathsDto,
  DeathQueryDto,
} from './deaths.dto';
import { DeathsService } from './deaths.service';

@Controller('deaths')
export class DeathsController {
  constructor(
    private readonly deathsService: DeathsService,
    private readonly animalsService: AnimalsService,
    private readonly salesService: SalesService,
    private readonly activitylogsService: ActivityLogsService,
    private readonly assignTypesService: AssignTypesService,
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
    const { animalTypeId } = queryDeath;

    const { take, page, sort } = requestPaginationDto;
    const pagination: PaginationType = addPagination({ page, take, sort });

    const deaths = await this.deathsService.findAll({
      search,
      pagination,
      animalTypeId,
      organizationId: user?.organizationId,
    });

    return reply({ res, results: deaths });
  }

  /** Post one Bulk death */
  @Post(`/bulk/create`)
  @UseGuards(UserAuthGuard)
  async createOneBulk(@Res() res, @Req() req, @Body() body: BulkDeathsDto) {
    const { user } = req;
    const { date, animals, note, animalTypeId } = body;

    const findOneAssignType = await this.assignTypesService.findOneBy({
      animalTypeId,
      organizationId: user.organizationId,
    });
    if (!findOneAssignType)
      throw new HttpException(
        `AnimalType not assigned please change`,
        HttpStatus.NOT_FOUND,
      );

    for (const animal of animals) {
      const findOneAnimal = await this.animalsService.findOneBy({
        code: animal.code,
        animalTypeId: findOneAssignType.animalTypeId,
      });
      if (findOneAnimal.status === 'DEAD')
        throw new HttpException(
          `Animal ${findOneAnimal.code} doesn't exists or already death, please change`,
          HttpStatus.NOT_FOUND,
        );

      const death = await this.deathsService.createOne({
        date,
        note,
        animalId: findOneAnimal.id,
        organizationId: user.organizationId,
        animalTypeId: findOneAssignType.animalTypeId,
        userCreatedId: user.id,
      });

      await this.animalsService.updateOne(
        { animalId: death.animalId },
        { status: 'DEAD' },
      );

      await this.activitylogsService.createOne({
        userId: user.id,
        date: new Date(),
        actionId: death.id,
        message: `${user.profile?.firstName} ${user.profile?.lastName} created a death in ${findOneAssignType?.animalType?.name}`,
        organizationId: user.organizationId,
      });
    }

    return reply({ res, results: 'Saved' });
  }

  /** Get one Death */
  @Get(`/view/:deathId`)
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
  async updateOneBulk(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateDeathsDto,
    @Param('deathId', ParseUUIDPipe) deathId: string,
  ) {
    const { user } = req;
    const { date, codeAnimal, note, status, number, animalTypeId } = body;

    const findOneAssignType = await this.assignTypesService.findOneBy({
      animalTypeId,
      organizationId: user.organizationId,
    });
    if (!findOneAssignType)
      throw new HttpException(
        `AnimalType not assigned please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneDeath = await this.deathsService.findOneBy({
      deathId,
      organizationId: user.organizationId,
    });
    if (!findOneDeath)
      throw new HttpException(
        `DeathId: ${deathId} please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneAnimal = await this.animalsService.findOneBy({
      code: codeAnimal,
    });
    if (!findOneAnimal)
      throw new HttpException(
        `Animal ${findOneAnimal.code} doesn't exists, isn't ACTIVE, please change`,
        HttpStatus.NOT_FOUND,
      );

    if (status === 'DEAD') {
      await this.deathsService.createOne({
        date,
        note,
        number,
        animalId: findOneAnimal.id,
        userCreatedId: user.id,
      });

      await this.animalsService.updateOne(
        { animalId: findOneDeath.animalId },
        { status: status },
      );
    }

    if (status === 'ACTIVE') {
      await this.animalsService.updateOne(
        { animalId: findOneAnimal.id },
        { status: status },
      );

      await this.deathsService.updateOne(
        { deathId: findOneDeath.id },
        { deletedAt: new Date() },
      );
    }

    if (status === 'SOLD') {
      await this.salesService.createOne({
        organizationId: user.organizationId,
        userCreatedId: user.id,
      });

      await this.animalsService.updateOne(
        { animalId: findOneAnimal.id },
        { status: status },
      );

      await this.salesService.updateOne(
        { saleId: findOneDeath.id },
        { deletedAt: new Date() },
      );

      await this.animalsService.updateOne(
        { animalId: findOneDeath.id },
        { quantity: findOneAnimal.quantity - number },
      );
    }

    await this.activitylogsService.createOne({
      userId: user.id,
      date: new Date(),
      actionId: findOneDeath.id,
      message: `${user.profile?.firstName} ${user.profile?.lastName} updated a death in ${findOneAssignType?.animalType?.name}`,
      organizationId: user.organizationId,
    });

    return reply({ res, results: 'Death updated successfully' });
  }

  /** Delete one Death */
  @Delete(`/delete/:deathId`)
  @UseGuards(UserAuthGuard)
  async deleteOne(
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

    const death = await this.deathsService.updateOne(
      { deathId: findOneDeadAnimal.id },
      { deletedAt: new Date() },
    );

    await this.activitylogsService.createOne({
      userId: user.id,
      date: new Date(),
      message: `${user.profile?.firstName} ${user.profile?.lastName} deleted a death  in ${findOneDeadAnimal.animalType.name}`,
      organizationId: user.organizationId,
    });

    return reply({ res, results: death });
  }
}
