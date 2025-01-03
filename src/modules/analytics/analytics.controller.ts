import { Controller, Get, Query, Req, Res, UseGuards } from '@nestjs/common';
import { reply } from '../../app/utils/reply';

import { DeathsService } from '../death/deaths.service';
import { EggHavestingsService } from '../egg-havesting/egg-havesting.service';
import { FarrowingsService } from '../farrowings/farrowings.service';
import { FeedingsService } from '../feeding/feedings.service';
import { FinancesService } from '../finances/finances.service';
import { IncubationsService } from '../incubation/incubation.service';
import { MilkingsService } from '../milking /milkings.service';
import { SalesService } from '../sales/sales.service';
import { UserAuthGuard } from '../users/middleware';
import { UsersService } from '../users/users.service';
import { WeaningsService } from '../weaning/weaning.service';
import {
  GetAnalyticsQuery,
  GetAnimalFarrowingsQuery,
  GetFinanceAnalyticsQuery,
} from './analytics.dto';
@Controller('analytics')
export class AnalyticsController {
  constructor(
    private readonly feedingsService: FeedingsService,
    private readonly eggHavestingsService: EggHavestingsService,
    private readonly incubationsService: IncubationsService,
    private readonly deathsService: DeathsService,
    private readonly salesService: SalesService,
    private readonly usersService: UsersService,
    private readonly farrowingsService: FarrowingsService,
    private readonly weaningsService: WeaningsService,
    private readonly milkingsService: MilkingsService,
    private readonly financesService: FinancesService,
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

  /** Get sales analytics. */
  @Get(`/sales`)
  @UseGuards(UserAuthGuard)
  async getSalesAnalysis(
    @Res() res,
    @Req() req,
    @Query() queryAnalytics: GetAnalyticsQuery,
  ) {
    const { days, months, year, animalTypeId, periode } = queryAnalytics;
    const { user } = req;

    const salesAnalytics = await this.salesService.getSalesAnalytics({
      days,
      year,
      months,
      animalTypeId,
      periode: Number(periode),
      organizationId: user?.organizationId,
    });

    return reply({ res, results: salesAnalytics });
  }

  /** Get Animal Farrowing analytics. */
  @Get(`/farrowings`)
  @UseGuards(UserAuthGuard)
  async getAnimalsFarrowingsAnalysis(
    @Res() res,
    @Req() req,
    @Query() queryFarrowingsAnalytics: GetAnimalFarrowingsQuery,
  ) {
    const { days, months, year, animalTypeId, animalId } =
      queryFarrowingsAnalytics;
    const { user } = req;

    const farrowingsAnalytics =
      await this.farrowingsService.getAnimalFarrowingsAnalytics({
        days,
        year,
        months,
        animalId,
        animalTypeId,
        organizationId: user?.organizationId,
      });

    return reply({ res, results: farrowingsAnalytics });
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

  /** Get revenue analytics. */
  @Get(`/revenue`)
  @UseGuards(UserAuthGuard)
  async getRevenueAnalysis(
    @Res() res,
    @Req() req,
    @Query() queryAnalytics: GetFinanceAnalyticsQuery,
  ) {
    const { days, months, year, periode } = queryAnalytics;
    const { user } = req;

    const financesAnalytics = await this.financesService.getFinanceAnalytics({
      days,
      year,
      months,
      periode: Number(periode),
      organizationId: user?.organizationId,
    });

    return reply({ res, results: financesAnalytics });
  }

  /** Get users analytics. */
  @Get(`/users`)
  @UseGuards(UserAuthGuard)
  async getUsersAnalysis(
    @Res() res,
    @Req() req,
    @Query() queryAnalytics: GetFinanceAnalyticsQuery,
  ) {
    const { days, months, year, periode } = queryAnalytics;
    const { user } = req;

    const financesAnalytics = await this.usersService.getUsersAnalytics({
      days,
      year,
      months,
      periode: Number(periode),
      organizationId: user?.organizationId,
    });

    return reply({ res, results: financesAnalytics });
  }
}
