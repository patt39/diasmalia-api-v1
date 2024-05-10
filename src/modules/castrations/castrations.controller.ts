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

import { getIpRequest, getUserAgent } from '../../app/utils/commons';
import { RequestPaginationDto } from '../../app/utils/pagination/request-pagination.dto';
import {
  addPagination,
  PaginationType,
} from '../../app/utils/pagination/with-pagination';
import { SearchQueryDto } from '../../app/utils/search-query/search-query.dto';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
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
    private readonly animalsService: AnimalsService,
    private readonly castrationsService: CastrationsService,
    private readonly assignTypesService: AssignTypesService,
    private readonly activitylogsService: ActivityLogsService,
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
    const { date, method, animals, note, animalTypeId } = body;

    const findOneAssignType = await this.assignTypesService.findOneBy({
      animalTypeId,
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
        code: animal.code,
        gender: 'MALE',
        animalTypeId: findOneAssignType.animalTypeId,
      });
      if (!findOneMale)
        throw new HttpException(
          `Animal ${findOneMale?.code} doesn't exists please change`,
          HttpStatus.NOT_FOUND,
        );

      const castration = await this.castrationsService.createOne({
        note,
        date,
        method,
        animalId: findOneMale.id,
        animalTypeId: findOneAssignType.animalTypeId,
        organizationId: user.organizationId,
        userCreatedId: user.id,
      });

      await this.activitylogsService.createOne({
        userId: user.id,
        date: new Date(),
        actionId: castration.id,
        message: `${user.profile?.firstName} ${user.profile?.lastName} castrated ${findOneMale?.code} in ${findOneAssignType.animalType.name}`,
        ipAddress: getIpRequest(req),
        userAgent: getUserAgent(req),
        organizationId: user.organizationId,
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
    const { note, method, maleCode, animalTypeId } = body;

    const findOneAssignType = await this.assignTypesService.findOneBy({
      animalTypeId,
      organizationId: user.organizationId,
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
      organizationId: user.organizationId,
      animalTypeId: findOneAssignType.animalTypeId,
    });
    if (!findOneAnimal)
      throw new HttpException(
        `Animal doesn't exists or isn't MALE please change`,
        HttpStatus.NOT_FOUND,
      );

    const castration = await this.castrationsService.updateOne(
      { castrationId: findOneCastration.id },
      {
        note,
        method,
        animalId: findOneAnimal.id,
        userCreatedId: user.id,
      },
    );

    await this.activitylogsService.createOne({
      userId: user.id,
      date: new Date(),
      actionId: castration.id,
      message: `${user.profile?.firstName} ${user.profile?.lastName} updated castration ${findOneAnimal?.code}  in ${findOneAssignType.animalType.name}`,
      ipAddress: getIpRequest(req),
      userAgent: getUserAgent(req),
      organizationId: user.organizationId,
    });

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

    const findOneCastration = await this.castrationsService.findOneBy({
      castrationId,
      organizationId: user.organizationId,
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

    const findOneCastration = await this.castrationsService.findOneBy({
      castrationId,
      organizationId: user.organizationId,
    });
    if (!findOneCastration)
      throw new HttpException(
        `CastrationId: ${castrationId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    await this.castrationsService.updateOne(
      { castrationId: findOneCastration.id },
      { deletedAt: new Date() },
    );

    await this.activitylogsService.createOne({
      userId: user.id,
      date: new Date(),
      message: `${user.profile?.firstName} ${user.profile?.lastName} deleted a castration`,
      ipAddress: getIpRequest(req),
      userAgent: getUserAgent(req),
      organizationId: user.organizationId,
    });

    return reply({ res, results: 'Castration deleted successfully' });
  }
}
