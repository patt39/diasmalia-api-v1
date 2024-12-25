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
import { formatDateDifference } from '../../app/utils/commons';
import { RequestPaginationDto } from '../../app/utils/pagination/request-pagination.dto';
import {
  PaginationType,
  addPagination,
} from '../../app/utils/pagination/with-pagination';
import { reply } from '../../app/utils/reply';
import { SearchQueryDto } from '../../app/utils/search-query/search-query.dto';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { AnimalsService } from '../animals/animals.service';
import { FeedStocksService } from '../feed-stock/feed-stock.service';
import { SuggestionService } from '../suggestions/suggestions.service';
import { UserAuthGuard } from '../users/middleware';
import {
  BulkFeedingsDto,
  CreateFeedingsDto,
  GetFeedQueryDto,
  UpdateFeedingsDto,
} from './feedings.dto';
import { FeedingsService } from './feedings.service';

@Controller('feedings')
export class FeedingsController {
  constructor(
    private readonly feedingsService: FeedingsService,
    private readonly animalsService: AnimalsService,
    private readonly suggestionsService: SuggestionService,
    private readonly feedStocksService: FeedStocksService,
    private readonly activitylogsService: ActivityLogsService,
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
    const { animalTypeId, periode } = queryFeeding;

    const { take, page, sort, sortBy } = requestPaginationDto;
    const pagination: PaginationType = addPagination({
      page,
      take,
      sort,
      sortBy,
    });

    const feedings = await this.feedingsService.findAll({
      search,
      pagination,
      animalTypeId,
      periode: Number(periode),
      organizationId: user?.organizationId,
    });

    return reply({ res, results: feedings });
  }

  /** Post one aves feeding */
  @Post(`/create/aves`)
  @UseGuards(UserAuthGuard)
  async createOne(@Res() res, @Req() req, @Body() body: CreateFeedingsDto) {
    const { user } = req;
    const { code, quantity, feedStockId } = body;

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

    const findFeedStock = await this.feedStocksService.findOneBy({
      feedStockId,
      organizationId: user?.organizationId,
      animalTypeId: findOneAnimal?.animalTypeId,
    });
    if (!findFeedStock)
      throw new HttpException(
        `FeedStockId: ${feedStockId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    if (findOneAnimal?.quantity === 0)
      throw new HttpException(
        `Unable to feed, animals doesn't exists please change`,
        HttpStatus.EXPECTATION_FAILED,
      );

    if (findFeedStock?.weight < quantity)
      throw new HttpException(
        `Insuficient amount of feed available please update feed stock`,
        HttpStatus.EXPECTATION_FAILED,
      );

    if (
      ['LAY FOOD', 'ALIMENT PONTE'].includes(findFeedStock?.feedCategory) &&
      findOneAnimal?.productionPhase === 'GROWTH'
    )
      throw new HttpException(
        `Impossible to create wrong feed type please change`,
        HttpStatus.EXPECTATION_FAILED,
      );

    const feeding = await this.feedingsService.createOne({
      quantity,
      animalId: findOneAnimal?.id,
      feedStockId: findFeedStock?.id,
      animalTypeId: findOneAnimal?.animalTypeId,
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
    });

    await this.feedStocksService.updateOne(
      { feedStockId: findFeedStock?.id },
      { weight: findFeedStock?.weight - quantity },
    );

    const feedDifference = Number(
      findFeedStock?.weight - (findFeedStock?.weight - quantity),
    );

    if (
      feedDifference === findFeedStock?.bagWeight &&
      !['FORAGES', 'FOURAGES', 'ENSILAGES', 'SILAGES'].includes(
        findFeedStock?.feedCategory,
      )
    ) {
      await this.feedStocksService.updateOne(
        { feedStockId: findFeedStock?.id },
        { number: findFeedStock?.number - 1 },
      );
    }

    if (
      findOneAnimal?.productionPhase === 'GROWTH' &&
      formatDateDifference(findOneAnimal?.birthday) === '0 days'
    ) {
      await this.suggestionsService.createOne({
        userId: user?.id,
        animalId: findOneAnimal?.id,
        organizationId: user?.organizationId,
        title: `Alimentation de la bande ${findOneAnimal.code}`,
        message: `Donner de l'alimentent croissance où pre-démarrage si possible riche en protéines (20-22%) et energie modéré en maintenant la temperature entre 32-34°C pour la croissances rapid des poussins jusqu'à la 6eme semaine de production`,
      });
    }

    if (formatDateDifference(findOneAnimal?.birthday) === '2 mnths') {
      await this.suggestionsService.createOne({
        userId: user?.id,
        animalId: findOneAnimal?.id,
        organizationId: user?.organizationId,
        title: `Alimentation de la bande ${findOneAnimal.code}`,
        message: `Donner uniquement de l'alimentent croissance et réduire les protéines (16-18%) tout en maintenant un bon équilibre énergétique à une temperature entre 20-22°C maintenant eclairage entre 20-22 heures par jour pour stimuler la prise alimentaire`,
      });
    }

    if (formatDateDifference(findOneAnimal?.birthday) === '4 mnths') {
      await this.suggestionsService.createOne({
        userId: user?.id,
        animalId: findOneAnimal?.id,
        organizationId: user?.organizationId,
        title: `Alimentation de la bande ${findOneAnimal.code}`,
        message: `Commencer a donner de aliment pre-ponte riche en calcium et protéines pour la production des coquilles et preparer la ponte. Reduisez l'éclairage à 8h par jour pour diminuer alimentation et eviter la prise de poids execissive qui pourra retarder la ponte`,
      });
    }

    if (
      ['Pondeuses', 'Poulets Goliaths', 'Poulets brahmas'].includes(
        findOneAnimal?.animalType?.name,
      ) &&
      formatDateDifference(findOneAnimal?.birthday) === '5 mnths'
    ) {
      await this.suggestionsService.createOne({
        userId: user?.id,
        animalId: findOneAnimal?.id,
        organizationId: user?.organizationId,
        title: `Alimentation de la bande ${findOneAnimal.code}`,
        message: `Bonne nouvelle les poules vont bientot entrer en ponte  passer à l'aliment ponte exclussivement avec Calcium élevé (3,5-4%): Indispensable pour des coquilles solides. Protéines (16-17%): Maintenir un bon développement corporel et la production d'œufs. Phosphore et oligo-éléments: Soutenir la santé osseuse et la ponte. Fournir des grains concassés ou des granulés pour éviter les pertes. Veiller à une hydratation constante avec de l'eau propre. 
        Maintenir 16 heures de lumière par jour pour stimuler la ponte. Assurer une lumière homogène et sans fluctuations tout en maintenant la temperature idéalement entre 18 et 24°C pour éviter le stress thermique`,
      });
    }

    await this.activitylogsService.createOne({
      userId: user?.id,
      message: `${user?.profile?.firstName} ${user?.profile?.lastName} feeded ${quantity}kg of feed in ${findOneAnimal?.animalType?.name} for ${findOneAnimal?.code} with ${findFeedStock?.feedCategory.toLocaleLowerCase()}`,
      organizationId: user?.organizationId,
    });

    return reply({
      res,
      results: {
        status: HttpStatus.CREATED,
        data: feeding,
        message: `Feeding Created Successfully`,
      },
    });
  }

  /** Post one Bulk feeding */
  @Post(`/bulk/create`)
  @UseGuards(UserAuthGuard)
  async createOneBulk(@Res() res, @Req() req, @Body() body: BulkFeedingsDto) {
    const { user } = req;
    const { quantity, animals, feedStockId } = body;

    const findFeedStock = await this.feedStocksService.findOneBy({
      feedStockId,
      organizationId: user?.organizationId,
    });
    if (!findFeedStock)
      throw new HttpException(
        `FeedStockId: ${feedStockId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    if (findFeedStock?.weight < quantity)
      throw new HttpException(
        `Insuficient amount of feed available please update feed stock`,
        HttpStatus.EXPECTATION_FAILED,
      );

    for (const animal of animals) {
      const findOneAnimal = await this.animalsService.findOneBy({
        status: 'ACTIVE',
        code: animal,
      });
      if (!findOneAnimal)
        throw new HttpException(
          `Animal ${findOneAnimal?.code} doesn't exists please change`,
          HttpStatus.NOT_FOUND,
        );

      if (
        [
          'LAY FOOD',
          'ALIMENT PONTE',
          'PREGNANT FEMALE',
          'FEMELLES GESTANTES',
          'LACTATING FEMALES',
          'FEMELLES ALLAITANTES',
        ].includes(findFeedStock?.feedCategory) &&
        findOneAnimal?.productionPhase === 'GROWTH'
      )
        throw new HttpException(
          `Impossible to create wrong feed type please change`,
          HttpStatus.EXPECTATION_FAILED,
        );

      const animalFed = Number((quantity * 1000) / animals?.length);

      await this.feedingsService.createOne({
        quantity: animalFed,
        animalId: findOneAnimal?.id,
        feedStockId: findFeedStock?.id,
        animalTypeId: findOneAnimal?.animalTypeId,
        organizationId: user?.organizationId,
        userCreatedId: user?.id,
      });
    }

    await this.feedStocksService.updateOne(
      { feedStockId: findFeedStock?.id },
      { weight: findFeedStock?.weight - quantity },
    );

    const feedDifference = Number(
      findFeedStock?.weight - (findFeedStock?.weight - quantity),
    );

    if (
      feedDifference === findFeedStock?.bagWeight &&
      !['FORAGES', 'SILAGES'].includes(findFeedStock?.feedCategory)
    ) {
      await this.feedStocksService.updateOne(
        { feedStockId: findFeedStock?.id },
        { number: findFeedStock?.number - 1 },
      );
    }

    await this.activitylogsService.createOne({
      userId: user?.id,
      organizationId: user?.organizationId,
      message: `${user?.profile?.firstName} ${user?.profile?.lastName} feeded ${quantity}kg of feed for ${animals?.length} in ${findFeedStock?.animalType?.name} with ${findFeedStock?.feedCategory.toLocaleLowerCase()}`,
    });

    return reply({ res, results: 'Saved' });
  }

  /** Update one feeding */
  @Put(`/:feedingId/edit`)
  @UseGuards(UserAuthGuard)
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: UpdateFeedingsDto,
    @Param('feedingId', ParseUUIDPipe) feedingId: string,
  ) {
    const { user } = req;
    const { quantity, feedStockId, code } = body;

    const findOneFeeding = await this.feedingsService.findOneBy({
      feedingId,
      organizationId: user?.organizationId,
    });
    if (!findOneFeeding)
      throw new HttpException(
        `FeedingId: ${feedingId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const findOneAnimal = await this.animalsService.findOneByCode({
      code,
      organizationId: user?.organizationId,
    });
    if (!findOneAnimal)
      throw new HttpException(
        `Code: ${code} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const findFeedStock = await this.feedStocksService.findOneBy({
      feedStockId,
      organizationId: user?.organizationId,
      animalTypeId: findOneAnimal?.animalTypeId,
    });
    if (!findFeedStock)
      throw new HttpException(
        `FeedStockId: ${feedStockId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    await this.feedingsService.updateOne(
      { feedingId: findOneFeeding?.id },
      {
        quantity,
        feedStockId: findFeedStock?.id,
        animalId: findOneAnimal?.id,
        userCreatedId: user?.id,
      },
    );

    await this.activitylogsService.createOne({
      userId: user?.id,
      organizationId: user?.organizationId,
      message: `${user?.profile?.firstName} ${user?.profile?.lastName} updated a feeding in ${findOneFeeding?.animalType.name} for ${findOneFeeding?.animal?.code}`,
    });

    return reply({ res, results: 'Feeding Updated Successfully' });
  }

  /** Delete one feeding */
  @Delete(`/:feedingId/delete`)
  @UseGuards(UserAuthGuard)
  async deleteOne(
    @Res() res,
    @Req() req,
    @Param('feedingId', ParseUUIDPipe) feedingId: string,
  ) {
    const { user } = req;

    const findOneFeeding = await this.feedingsService.findOneBy({
      feedingId,
      organizationId: user?.organizationId,
    });
    if (!findOneFeeding)
      throw new HttpException(
        `FeedingId: ${feedingId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const feeding = await this.feedingsService.updateOne(
      { feedingId: findOneFeeding?.id },
      { deletedAt: new Date() },
    );

    await this.activitylogsService.createOne({
      userId: user?.id,
      organizationId: user?.organizationId,
      message: `${user?.profile?.firstName} ${user?.profile?.lastName} deleted a feeding in ${findOneFeeding?.animalType?.name}`,
    });

    return reply({ res, results: feeding });
  }
}
