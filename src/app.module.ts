import { Module } from '@nestjs/common';
import { DatabaseModule } from './app/database/database.module';
import { AnimalTypesModule } from './modules/animal-type/animal-type.module';
import { AnimalsModule } from './modules/animals/animals.module';
import { AssignTasksModule } from './modules/assigne-tasks/assigne-tasks.module';
import { AssignTypesModule } from './modules/assigne-type/assigne-type.module';
import { AuthProvidersModule } from './modules/auth-providers/auth-providers.module';
import { BreedingsModule } from './modules/breedings/breedings.module';
import { BreedsModule } from './modules/breeds/breeds.module';
import { CastrationsModule } from './modules/castrations/castrations.module';
import { CheckPregnanciesModule } from './modules/check-pregnancies/check-pregnancies.module';
import { ContactUsModule } from './modules/contact-us/contact-us.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { ContributorsModule } from './modules/contributors/contributors.module';
import { CurrenciesModule } from './modules/currency/currency.module';
import { DeathsModule } from './modules/death/deaths.module';
import { EggHavestingsModule } from './modules/egg-havesting/egg-havesting.module';
import { FarrowingsModule } from './modules/farrowings/farrowings.module';
import { FeedingsModule } from './modules/feeding/feedings.module';
import { FinanceModule } from './modules/finances/finances.module';
import { GestationsModule } from './modules/gestation/gestations.module';
import { IncubationsModule } from './modules/incubation/incubation.module';
import { IsolationsModule } from './modules/isolations/isolations.module';
import { LocationsModule } from './modules/locations/locations.module';
import { MilkingsModule } from './modules/milking /milkings.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { SalesModule } from './modules/sales/sales.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { TreatmentsModule } from './modules/treatments/treatments.module';
import { UsersModule } from './modules/users/users.module';
import { WeaningsModule } from './modules/weaning/weaning.module';

@Module({
  imports: [
    DatabaseModule,
    ContactsModule,
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
    SalesModule,
    EggHavestingsModule,
    AnimalTypesModule,
    IncubationsModule,
    AssignTypesModule,
    IsolationsModule,
    CastrationsModule,
    FarrowingsModule,
    FeedingsModule,
    AssignTasksModule,
    FinanceModule,
    ContactUsModule,
    CurrenciesModule,
    ContributorsModule,
    OrganizationsModule,
    AuthProvidersModule,
    CheckPregnanciesModule,
  ],
})
export class AppModule {}
