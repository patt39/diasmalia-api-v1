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
import { RequestPaginationDto } from '../../app/utils/pagination/request-pagination.dto';
import {
  PaginationType,
  addPagination,
} from '../../app/utils/pagination/with-pagination';
import { reply } from '../../app/utils/reply';
import { SearchQueryDto } from '../../app/utils/search-query/search-query.dto';
import { AnimalsService } from '../animals/animals.service';
import { JwtAuthGuard } from '../users/middleware';
import { BulkDeathsDto, CreateOrUpdateDeathsDto } from './deaths.dto';
import { DeathsService } from './deaths.service';

@Controller('deaths')
export class DeathsController {
  constructor(
    private readonly deathsService: DeathsService,
    private readonly animalsService: AnimalsService,
  ) {}

  /** Get all deaths */
  @Get(`/`)
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Res() res,
    @Req() req,
    @Query() requestPaginationDto: RequestPaginationDto,
    @Query() query: SearchQueryDto,
  ) {
    const { user } = req;
    const { search } = query;

    const { take, page, sort } = requestPaginationDto;
    const pagination: PaginationType = addPagination({ page, take, sort });

    const deaths = await this.deathsService.findAll({
      search,
      pagination,
      organizationId: user?.organizationId,
    });

    return reply({ res, results: deaths });
  }

  /** Post one death */
  @Post(`/`)
  @UseGuards(JwtAuthGuard)
  async createOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateDeathsDto,
  ) {
    const { user } = req;
    const { date, codeAnimal, note } = body;

    const findOneAnimal = await this.animalsService.findOneBy({
      code: codeAnimal,
      status: 'ACTIVE',
      organizationId: user.organizationId,
    });
    if (!findOneAnimal) {
      throw new HttpException(
        `Animal ${findOneAnimal.code} doesn't exists, isn't ACTIVE, please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    const death = await this.deathsService.createOne({
      date,
      note,
      animalId: findOneAnimal?.id,
      organizationId: findOneAnimal?.organizationId,
      userCreatedId: user?.id,
    });

    await this.animalsService.updateOne(
      { animalId: death.animalId },
      {
        status: 'DEAD',
      },
    );

    return reply({ res, results: death });
  }

  /** Post one Bulk death */
  @Post(`/bulk`)
  @UseGuards(JwtAuthGuard)
  async createOneBulk(@Res() res, @Req() req, @Body() body: BulkDeathsDto) {
    const { user } = req;
    const { date, animals, note } = body;

    for (const animal of animals) {
      const findOneAnimal = await this.animalsService.findOneBy({
        status: 'ACTIVE',
        code: animal?.code,
        organizationId: user.organizationId,
      });
      if (!findOneAnimal) {
        throw new HttpException(
          `Animal ${findOneAnimal.code} doesn't exists please change`,
          HttpStatus.NOT_FOUND,
        );
      }

      const death = await this.deathsService.createOne({
        date,
        note,
        animalId: findOneAnimal?.id,
        organizationId: findOneAnimal?.organizationId,
        userCreatedId: user?.id,
      });

      await this.animalsService.updateOne(
        { animalId: death.animalId },
        {
          status: 'DEAD',
        },
      );
    }

    return reply({ res, results: 'Saved' });
  }

  /** Get one Death */
  @Get(`/view`)
  @UseGuards(JwtAuthGuard)
  async getOneByIdDeath(
    @Res() res,
    @Req() req,
    @Query('deathId', ParseUUIDPipe) deathId: string,
  ) {
    const { user } = req;
    const findOneDeadAnimal = await this.deathsService.findOneBy({
      deathId,
      organizationId: user.organizationId,
    });
    if (!findOneDeadAnimal) {
      throw new HttpException(
        `${deathId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }

    return reply({ res, results: findOneDeadAnimal });
  }

  /** Delete one Death */
  @Delete(`/delete/:deathId`)
  @UseGuards(JwtAuthGuard)
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
    if (!findOneDeadAnimal) {
      throw new HttpException(
        `${deathId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    }
    const death = await this.deathsService.updateOne(
      { deathId: findOneDeadAnimal.id },
      { deletedAt: new Date() },
    );

    return reply({ res, results: death });
  }
}
