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
  BulkCastrationsDto,
  CreateOrUpdateCastrationsDto,
  GetCastrationsQueryDto,
} from './castrations.dto';
import { CastrationsService } from './castrations.service';

@Controller('castrations')
export class CastrationsController {
  constructor(
    private readonly castrationsService: CastrationsService,
    private readonly animalsService: AnimalsService,
    private readonly assignTypesService: AssignTypesService,
  ) {}

  /** Get all castrations */
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
    const { method, animalTypeId } = queryCastration;

    const { take, page, sort } = requestPaginationDto;
    const pagination: PaginationType = addPagination({ page, take, sort });

    const castrations = await this.castrationsService.findAll({
      search,
      method,
      pagination,
      animalTypeId,
      organizationId: user.organizationId,
    });

    return reply({ res, results: castrations });
  }

  /** Post one Bulk castration */
  @Post(`/bulk/create`)
  @UseGuards(UserAuthGuard)
  async createOneBulk(
    @Res() res,
    @Req() req,
    @Body() body: BulkCastrationsDto,
  ) {
    const { user } = req;
    const { date, method, animals, note } = body;

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
      const findOneMale = await this.animalsService.findOneBy({
        status: 'ACTIVE',
        code: animal?.code,
        gender: 'MALE',
        animalTypeId: findOneAssignType.animalTypeId,
      });
      if (!findOneMale)
        throw new HttpException(
          `Animal ${findOneMale?.code} doesn't exists please change`,
          HttpStatus.NOT_FOUND,
        );

      await this.castrationsService.createOne({
        note,
        date,
        method,
        animalId: findOneMale.id,
        animalTypeId: findOneAssignType.animalTypeId,
        organizationId: user.organizationId,
        userCreatedId: user?.id,
      });
    }

    return reply({ res, results: 'Saved' });
  }

  /** Update one castration */
  @Put(`/:castrationId/edit`)
  @UseGuards(UserAuthGuard)
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateCastrationsDto,
    @Param('castrationId', ParseUUIDPipe) castrationId: string,
  ) {
    const { user } = req;
    const { date, note, method, maleCode } = body;

    const findOneAssignType = await this.assignTypesService.findOneBy({
      status: true,
      organizationId: user?.organizationId,
    });
    if (!findOneAssignType)
      throw new HttpException(
        `AnimalType not assigned please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneCastration = await this.castrationsService.findOneBy({
      castrationId,
      organizationId: user.organizationId,
      animalTypeId: findOneAssignType.animalTypeId,
    });
    if (!findOneCastration)
      throw new HttpException(
        `CastrationId: ${castrationId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneAnimal = await this.animalsService.findOneBy({
      code: maleCode,
      gender: 'MALE',
      status: 'ACTIVE',
    });
    if (!findOneAnimal)
      throw new HttpException(
        `Animal doesn't exists or isn't MALE please change`,
        HttpStatus.NOT_FOUND,
      );

    const castration = await this.castrationsService.updateOne(
      { castrationId: findOneCastration.id },
      {
        date,
        note,
        method,
        animalId: findOneAnimal.id,
        organizationId: user.organizationId,
        userCreatedId: user?.id,
      },
    );

    return reply({ res, results: castration });
  }

  /** Get one castration */
  @Get(`/view/:castrationId`)
  @UseGuards(UserAuthGuard)
  async getOneByIdBreed(
    @Res() res,
    @Req() req,
    @Param('castrationId') castrationId: string,
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

    const findOneCastration = await this.castrationsService.findOneBy({
      castrationId,
      organizationId: user.organizationId,
      animalTypeId: findOneAssignType.animalTypeId,
    });
    if (!findOneCastration)
      throw new HttpException(
        `CastrationId: ${castrationId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    return reply({ res, results: findOneCastration });
  }

  /** Delete one castration */
  @Delete(`/delete/:castrationId`)
  @UseGuards(UserAuthGuard)
  async deleteOne(
    @Res() res,
    @Req() req,
    @Param('castrationId', ParseUUIDPipe) castrationId: string,
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

    const findOneCastration = await this.castrationsService.findOneBy({
      castrationId,
      organizationId: user.organizationId,
      animalTypeId: findOneAssignType.animalTypeId,
    });
    if (!findOneCastration)
      throw new HttpException(
        `CastrationId: ${castrationId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    await this.castrationsService.updateOne(
      { castrationId: findOneCastration?.id },
      { deletedAt: new Date() },
    );

    return reply({ res, results: 'Castration deleted successfully' });
  }
}
