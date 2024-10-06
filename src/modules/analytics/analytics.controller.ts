import { Controller, Get, Query, Req, Res, UseGuards } from '@nestjs/common';
import { reply } from '../../app/utils/reply';

import { DeathsService } from '../death/deaths.service';
import { EggHavestingsService } from '../egg-havesting/egg-havesting.service';
import { FeedingsService } from '../feeding/feedings.service';
import { IncubationsService } from '../incubation/incubation.service';
import { MilkingsService } from '../milking /milkings.service';
import { SalesService } from '../sales/sales.service';
import { UserAuthGuard } from '../users/middleware';
import { WeaningsService } from '../weaning/weaning.service';
import { GetAnalyticsQuery } from './analytics.dto';
@Controller('analytics')
export class AnalyticsController {
  constructor(
    private readonly feedingsService: FeedingsService,
    private readonly eggHavestingsService: EggHavestingsService,
    private readonly incubationsService: IncubationsService,
    private readonly deathsService: DeathsService,
    private readonly salesService: SalesService,
    private readonly weaningsService: WeaningsService,
    private readonly milkingsService: MilkingsService,
  ) {}

  /** Get egg-harvestings analytics. */
  @Get(`/egg-harvestings`)
  @UseGuards(UserAuthGuard)
  async getEggHarvestinsAnalytics(
    @Res() res,
    @Req() req,
    @Query() queryAnalytics: GetAnalyticsQuery,
  ) {
    const { days, months, year, animalTypeId, periode } = queryAnalytics;
    const { user } = req;

    const eggHarvestingAnalytics =
      await this.eggHavestingsService.findAllEggHarvestingsAnimalAnalytics({
        days,
        year,
        months,
        animalTypeId,
        periode: Number(periode),
        organizationId: user?.organizationId,
      });

    return reply({ res, results: eggHarvestingAnalytics });
  }

  /** Get feedings analytics. */
  @Get(`/feedings`)
  @UseGuards(UserAuthGuard)
  async getFeedingAnalytics(
    @Res() res,
    @Req() req,
    @Query() queryAnalytics: GetAnalyticsQuery,
  ) {
    const { days, months, year, animalTypeId, periode } = queryAnalytics;
    const { user } = req;

    const feedingAnalytics =
      await this.feedingsService.getAnimalFeedingAnalytics({
        days,
        year,
        months,
        animalTypeId,
        periode: Number(periode),
        organizationId: user?.organizationId,
      });

    return reply({ res, results: feedingAnalytics });
  }

  /** Get incubations analytics. */
  @Get(`/incubations`)
  @UseGuards(UserAuthGuard)
  async getIncubationsAnalysis(
    @Res() res,
    @Req() req,
    @Query() queryAnalytics: GetAnalyticsQuery,
  ) {
    const { days, months, year, animalTypeId, periode } = queryAnalytics;
    const { user } = req;

    const feedingAnalytics =
      await this.incubationsService.getAnimalIncubationsAnalytics({
        days,
        year,
        months,
        animalTypeId,
        periode: Number(periode),
        organizationId: user?.organizationId,
      });

    return reply({ res, results: feedingAnalytics });
  }

  /** Get deaths analytics. */
  @Get(`/deaths`)
  @UseGuards(UserAuthGuard)
  async getDeathsAnalysis(
    @Res() res,
    @Req() req,
    @Query() queryAnalytics: GetAnalyticsQuery,
  ) {
    const { days, months, year, animalTypeId, periode } = queryAnalytics;
    const { user } = req;

    const feedingAnalytics = await this.deathsService.getAnimalDeathAnalytics({
      days,
      year,
      months,
      animalTypeId,
      periode: Number(periode),
      organizationId: user?.organizationId,
    });

    return reply({ res, results: feedingAnalytics });
  }

  /** Get chickens sales analytics. */
  @Get(`/sales/chickens`)
  @UseGuards(UserAuthGuard)
  async getChickensSalesAnalysis(
    @Res() res,
    @Req() req,
    @Query() queryAnalytics: GetAnalyticsQuery,
  ) {
    const { days, months, year, animalTypeId, periode } = queryAnalytics;
    const { user } = req;

    const chickensSalesAnalytics =
      await this.salesService.getChikenSalesAnalytics({
        days,
        year,
        months,
        animalTypeId,
        periode: Number(periode),
        organizationId: user?.organizationId,
      });

    return reply({ res, results: chickensSalesAnalytics });
  }

  /** Get chicks sales analytics. */
  @Get(`/sales/chicks`)
  @UseGuards(UserAuthGuard)
  async getChicksSalesAnalysis(
    @Res() res,
    @Req() req,
    @Query() queryAnalytics: GetAnalyticsQuery,
  ) {
    const { days, months, year, animalTypeId, periode } = queryAnalytics;
    const { user } = req;

    const chicksSalesAnalytics = await this.salesService.getChickSalesAnalytics(
      {
        days,
        year,
        months,
        animalTypeId,
        periode: Number(periode),
        organizationId: user?.organizationId,
      },
    );

    return reply({ res, results: chicksSalesAnalytics });
  }

  /** Get eggs sales analytics. */
  @Get(`/sales/eggs`)
  @UseGuards(UserAuthGuard)
  async getEggSalesAnalysis(
    @Res() res,
    @Req() req,
    @Query() queryAnalytics: GetAnalyticsQuery,
  ) {
    const { days, months, year, animalTypeId, periode } = queryAnalytics;
    const { user } = req;

    const eggSalesAnalytics = await this.salesService.getEggSalesAnalytics({
      days,
      year,
      months,
      animalTypeId,
      periode: Number(periode),
      organizationId: user?.organizationId,
    });

    return reply({ res, results: eggSalesAnalytics });
  }

  /** Get animals sales analytics. */
  @Get(`/sales/animals`)
  @UseGuards(UserAuthGuard)
  async getAnimalSalesAnalysis(
    @Res() res,
    @Req() req,
    @Query() queryAnalytics: GetAnalyticsQuery,
  ) {
    const { days, months, year, animalTypeId, periode } = queryAnalytics;
    const { user } = req;

    const animalsAnalytics = await this.salesService.getAnimalSalesAnalytics({
      days,
      year,
      months,
      animalTypeId,
      periode: Number(periode),
      organizationId: user?.organizationId,
    });

    return reply({ res, results: animalsAnalytics });
  }

  /** Get weanings analytics. */
  @Get(`/weanings`)
  @UseGuards(UserAuthGuard)
  async getWeaningsAnalysis(
    @Res() res,
    @Req() req,
    @Query() queryAnalytics: GetAnalyticsQuery,
  ) {
    const { days, months, year, animalTypeId, periode } = queryAnalytics;
    const { user } = req;

    const weaningsAnalytics = await this.weaningsService.getWeaninsAnalytics({
      days,
      year,
      months,
      animalTypeId,
      periode: Number(periode),
      organizationId: user?.organizationId,
    });

    return reply({ res, results: weaningsAnalytics });
  }

  /** Get milkings analytics. */
  @Get(`/milkings`)
  @UseGuards(UserAuthGuard)
  async getMilkingsAnalysis(
    @Res() res,
    @Req() req,
    @Query() queryAnalytics: GetAnalyticsQuery,
  ) {
    const { days, months, year, animalTypeId, periode } = queryAnalytics;
    const { user } = req;

    const milkingsAnalytics =
      await this.milkingsService.getAnimalMilkingAnalytics({
        days,
        year,
        months,
        animalTypeId,
        periode: Number(periode),
        organizationId: user?.organizationId,
      });

    return reply({ res, results: milkingsAnalytics });
  }
}
