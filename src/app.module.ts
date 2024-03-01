import { Module } from '@nestjs/common';
import { DatabaseModule } from './app/database/database.module';
import { AnimalsModule } from './modules/animals/animals.module';
import { AssignTasksModule } from './modules/assigne-tasks/assigne-tasks.module';
import { AuthProvidersModule } from './modules/auth-providers/auth-providers.module';
import { BreedingsModule } from './modules/breedings/breedings.module';
import { BreedsModule } from './modules/breeds/breeds.module';
import { CastrationsModule } from './modules/castrations/castrations.module';
import { CheckPregnanciesModule } from './modules/check-pregnancies/check-pregnancies.module';
import { ContactUsModule } from './modules/contact-us/contact-us.module';
import { ContributorsModule } from './modules/contributors/contributors.module';
import { DeathsModule } from './modules/death/deaths.module';
import { FarrowingsModule } from './modules/farrowings/farrowings.module';
import { FeedingsModule } from './modules/feeding/feedings.module';
import { FinanceModule } from './modules/finances/finances.module';
import { GestationsModule } from './modules/gestation/gestations.module';
import { IsolationsModule } from './modules/isolations/isolations.module';
import { LocationsModule } from './modules/locations/locations.module';
import { MilkingsModule } from './modules/milking /milkings.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { SellingsModule } from './modules/selling/sellings.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { TreatmentsModule } from './modules/treatments/treatments.module';
import { UsersModule } from './modules/users/users.module';
import { WeaningsModule } from './modules/weaning/weaning.module';

@Module({
  imports: [
    DatabaseModule,
    ContactUsModule,
    ProfilesModule,
    UsersModule,
    TasksModule,
    BreedsModule,
    AnimalsModule,
    WeaningsModule,
    FeedingsModule,
    DeathsModule,
    GestationsModule,
    MilkingsModule,
    BreedingsModule,
    TreatmentsModule,
    LocationsModule,
    SellingsModule,
    IsolationsModule,
    CastrationsModule,
    FarrowingsModule,
    FeedingsModule,
    AssignTasksModule,
    FinanceModule,
    ContributorsModule,
    OrganizationsModule,
    AuthProvidersModule,
    CheckPregnanciesModule,
  ],
})
export class AppModule {}
