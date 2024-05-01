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
import { UserAuthGuard } from '../users/middleware';
import {
  BulkFeedingsDto,
  CreateOrUpdateFeedingsDto,
  GetFeedQueryDto,
} from './feedings.dto';
import { FeedingsService } from './feedings.service';

@Controller('feedings')
export class FeedingsController {
  constructor(
    private readonly feedingsService: FeedingsService,
    private readonly animalsService: AnimalsService,
    private readonly activitylogsService: ActivityLogsService,
    private readonly assignTypesService: AssignTypesService,
  ) {}

  /** Get all Feedings */
  @Get(`/`)
  @UseGuards(UserAuthGuard)
  async findAll(
    @Res() res,
    @Req() req,
    @Query() requestPaginationDto: RequestPaginationDto,
    @Query() query: SearchQueryDto,
    @Query() queryFeeding: GetFeedQueryDto,
  ) {
    const { user } = req;
    const { search } = query;
    const { animalTypeId } = queryFeeding;

    const { take, page, sort } = requestPaginationDto;
    const pagination: PaginationType = addPagination({ page, take, sort });

    const feedings = await this.feedingsService.findAll({
      search,
      pagination,
      animalTypeId,
      organizationId: user?.organizationId,
    });

    return reply({ res, results: feedings });
  }

  /** Post one Bulk feeding */
  @Post(`/bulk/create`)
  @UseGuards(UserAuthGuard)
  async createOneBulk(@Res() res, @Req() req, @Body() body: BulkFeedingsDto) {
    const { user } = req;
    const {
      date,
      note,
      quantity,
      animals,
      feedType,
      productionPhase,
      animalTypeId,
    } = body;

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
        status: 'ACTIVE',
        code: animal?.code,
      });
      if (!findOneAnimal)
        throw new HttpException(
          `Animal ${findOneAnimal?.code} doesn't exists please change`,
          HttpStatus.NOT_FOUND,
        );

      const feeding = await this.feedingsService.createOne({
        note,
        date,
        quantity,
        feedType,
        productionPhase,
        animalId: findOneAnimal.id,
        animalTypeId: findOneAssignType.animalTypeId,
        organizationId: user.organizationId,
        userCreatedId: user.id,
      });

      await this.activitylogsService.createOne({
        userId: user.id,
        date: new Date(),
        actionId: feeding.id,
        message: `${user.profile?.firstName} ${user.profile?.lastName} created a feeding in ${findOneAssignType.animalType.name}`,
        organizationId: user.organizationId,
      });
    }

    return reply({ res, results: 'Saved' });
  }

  /** Update one feeding */
  @Put(`/:feedingId/edit`)
  @UseGuards(UserAuthGuard)
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateFeedingsDto,
    @Param('feedingId', ParseUUIDPipe) feedingId: string,
  ) {
    const { user } = req;
    const { date, quantity, feedType, code, note, productionPhase } = body;

    const findOneAssignType = await this.assignTypesService.findOneBy({
      status: true,
      organizationId: user.organizationId,
    });
    if (!findOneAssignType)
      throw new HttpException(
        `AnimalType not assigned please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneAnimal = await this.animalsService.findOneBy({
      code,
      organizationId: user.organizationId,
    });
    if (!findOneAnimal)
      throw new HttpException(
        `Animal ${code} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneFeeding = await this.feedingsService.findOneBy({
      feedingId,
      organizationId: user.organizationId,
      animalTypeId: findOneAssignType.animalTypeId,
    });
    if (!findOneFeeding)
      throw new HttpException(
        `FeedingId: ${feedingId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const feeding = await this.feedingsService.updateOne(
      { feedingId: findOneFeeding.id },
      {
        date,
        note,
        quantity,
        feedType,
        productionPhase,
        animalId: findOneAnimal.id,
        userCreatedId: user.id,
      },
    );

    await this.activitylogsService.createOne({
      userId: user.id,
      date: new Date(),
      actionId: feeding.id,
      message: `${user.profile?.firstName} ${user.profile?.lastName} created a feeding`,
      organizationId: user.organizationId,
    });

    return reply({ res, results: 'Feeding Created Successfully' });
  }

  /** Get one feeding */
  @Get(`/view/feedingId`)
  @UseGuards(UserAuthGuard)
  async getOneByIdFeeding(
    @Res() res,
    @Res() req,
    @Param('feedingId', ParseUUIDPipe) feedingId: string,
  ) {
    const { user } = req;

    const findOneAssignType = await this.assignTypesService.findOneBy({
      status: true,
      organizationId: user.organizationId,
    });
    if (!findOneAssignType)
      throw new HttpException(
        `AnimalType not assigned please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneFeeding = await this.feedingsService.findOneBy({
      feedingId,
      organizationId: user.organizationId,
      animalTypeId: findOneAssignType.animalTypeId,
    });
    if (!findOneFeeding)
      throw new HttpException(
        `FeedingId: ${feedingId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    return reply({ res, results: findOneFeeding });
  }

  /** Delete one feeding */
  @Delete(`/delete/:feedingId`)
  @UseGuards(UserAuthGuard)
  async deleteOne(
    @Res() res,
    @Req() req,
    @Param('feedingId', ParseUUIDPipe) feedingId: string,
  ) {
    const { user } = req;

    const findOneFeeding = await this.feedingsService.findOneBy({
      feedingId,
      organizationId: user.organizationId,
    });
    if (!findOneFeeding)
      throw new HttpException(
        `FeedingId: ${feedingId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const feeding = await this.feedingsService.updateOne(
      { feedingId: findOneFeeding.id },
      { deletedAt: new Date() },
    );

    await this.activitylogsService.createOne({
      userId: user.id,
      date: new Date(),
      actionId: feeding.id,
      message: `${user.profile?.firstName} ${user.profile?.lastName} deleted a feeding`,
      organizationId: user.organizationId,
    });

    return reply({ res, results: feeding });
  }
}
