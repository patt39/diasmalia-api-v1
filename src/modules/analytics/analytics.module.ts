import { Module } from '@nestjs/common';
import { AssignTypesService } from '../assigne-type/assigne-type.service';
import { DeathsService } from '../death/deaths.service';
import { EggHavestingsService } from '../egg-havesting/egg-havesting.service';
import { FeedingsService } from '../feeding/feedings.service';
import { IncubationsService } from '../incubation/incubation.service';
import { MilkingsService } from '../milking /milkings.service';
import { SalesService } from '../sales/sales.service';
import { WeaningsService } from '../weaning/weaning.service';
import { AnalyticsController } from './analytics.controller';

@Module({
  controllers: [AnalyticsController],
  providers: [
    EggHavestingsService,
    AssignTypesService,
    FeedingsService,
    IncubationsService,
    DeathsService,
    SalesService,
    WeaningsService,
    MilkingsService,
  ],
})
export class AnalyticsModule {}
