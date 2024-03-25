import { Module } from '@nestjs/common';
import { DatabaseModule } from './app/database/database.module';
import { AssignTasksModule } from './modules/assigne-tasks/assigne-tasks.module';
import { AuthProvidersModule } from './modules/auth-providers/auth-providers.module';
import { ContactUsModule } from './modules/contact-us/contact-us.module';
import { ContributorsModule } from './modules/contributors/contributors.module';
import { DeathsModule } from './modules/death/deaths.module';
import { EggHavestingsModule } from './modules/egg-havesting/egg-havesting.module';
import { FeedingsModule } from './modules/feeding/feedings.module';
import { FinanceModule } from './modules/finances/finances.module';
import { IncubationsModule } from './modules/incubation/incubation.module';
import { LocationsModule } from './modules/locations/locations.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { SalesModule } from './modules/sales/sales.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { TreatmentsModule } from './modules/treatments/treatments.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    DatabaseModule,
    ContactUsModule,
    ProfilesModule,
    UsersModule,
    TasksModule,
    FeedingsModule,
    DeathsModule,
    TreatmentsModule,
    LocationsModule,
    SalesModule,
    FeedingsModule,
    AssignTasksModule,
    FinanceModule,
    EggHavestingsModule,
    IncubationsModule,
    ContributorsModule,
    OrganizationsModule,
    AuthProvidersModule,
  ],
})
export class AppModule {}
