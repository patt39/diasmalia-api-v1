import { Controller, Get, Query, Req, Res, UseGuards } from '@nestjs/common';
import { reply } from '../../app/utils/reply';

import { EggHavestingsService } from '../egg-havesting/egg-havesting.service';
import { FeedingsService } from '../feeding/feedings.service';
import { UserAuthGuard } from '../users/middleware';
import { GetAnalyticsQuery } from './analytics.dto';
@Controller('analytics')
export class AnalyticsController {
  constructor(
    private readonly feedingsService: FeedingsService,
    private readonly eggHavestingsService: EggHavestingsService,
  ) {}

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

  @Get(`/feedings`)
  @UseGuards(UserAuthGuard)
  async findAll(
    @Res() res,
    @Req() req,
    @Query() queryAnalytics: GetAnalyticsQuery,
  ) {
    const { days, months, year, animalTypeId, periode } = queryAnalytics;
    const { user } = req;

    const feedingAnalytics =
      await this.feedingsService.getanimalFeedingAnalytics({
        days,
        year,
        months,
        animalTypeId,
        periode: Number(periode),
        organizationId: user?.organizationId,
      });

    return reply({ res, results: feedingAnalytics });
  }
}
