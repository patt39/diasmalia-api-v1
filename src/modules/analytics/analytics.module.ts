import { Module } from '@nestjs/common';
import { AnimalsService } from '../animals/animals.service';
import { AssignTypesService } from '../assigne-type/assigne-type.service';
import { DeathsService } from '../death/deaths.service';
import { EggHavestingsService } from '../egg-havesting/egg-havesting.service';
import { FarrowingsService } from '../farrowings/farrowings.service';
import { FeedingsService } from '../feeding/feedings.service';
import { FinancesService } from '../finances/finances.service';
import { IncubationsService } from '../incubation/incubation.service';
import { MilkingsService } from '../milking /milkings.service';
import { SalesService } from '../sales/sales.service';
import { UsersService } from '../users/users.service';
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
    UsersService,
    AnimalsService,
    FarrowingsService,
    WeaningsService,
    MilkingsService,
    FinancesService,
  ],
})
export class AnalyticsModule {}
