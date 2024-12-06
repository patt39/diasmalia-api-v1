import { Module } from '@nestjs/common';
import { DatabaseModule } from './app/database/database.module';
import { ActivityLogsModule } from './modules/activity-logs/activity-logs.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AnimalTypesModule } from './modules/animal-type/animal-type.module';
import { AnimalsModule } from './modules/animals/animals.module';
import { AssignMaterialsModule } from './modules/assigne-material/assigne-material.module';
import { AssignTypesModule } from './modules/assigne-type/assigne-type.module';
import { AuthProvidersModule } from './modules/auth-providers/auth-providers.module';
import { BlogsModule } from './modules/blog/blog.module';
import { BreedingsModule } from './modules/breedings/breedings.module';
import { BreedsModule } from './modules/breeds/breeds.module';
import { BuildingsModule } from './modules/buildings/buildings.module';
import { CagesModule } from './modules/cages/cages.module';
import { CheckPregnanciesModule } from './modules/check-pregnancies/check-pregnancies.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { ContributorsModule } from './modules/contributors/contributors.module';
import { CountriesModule } from './modules/country/country.module';
import { CurrenciesModule } from './modules/currency/currency.module';
import { DeathsModule } from './modules/death/deaths.module';
import { EggHavestingsModule } from './modules/egg-havesting/egg-havesting.module';
import { FaqsModule } from './modules/faq/faq.module';
import { FarrowingsModule } from './modules/farrowings/farrowings.module';
import { FatteningsModule } from './modules/fattenings/fattening.module';
import { FeedStockModule } from './modules/feed-stock/feed-stock.module';
import { FeedingsModule } from './modules/feeding/feedings.module';
import { FinanceModule } from './modules/finances/finances.module';
import { GestationsModule } from './modules/gestation/gestations.module';
import { HealthModule } from './modules/health/health.module';
import { ImagesModule } from './modules/images/images.module';
import { IncubationsModule } from './modules/incubation/incubation.module';
import { IsolationsModule } from './modules/isolations/isolations.module';
import { LocationsModule } from './modules/locations/locations.module';
import { MaterialsModule } from './modules/material/material.module';
import { MilkingsModule } from './modules/milking /milkings.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { SalesModule } from './modules/sales/sales.module';
import { SuggestionsModule } from './modules/suggestions/suggestions.module';
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
    BlogsModule,
    HealthModule,
    FaqsModule,
    CagesModule,
    ImagesModule,
    MaterialsModule,
    CountriesModule,
    FeedStockModule,
    AnalyticsModule,
    SuggestionsModule,
    BuildingsModule,
    AssignMaterialsModule,
    EggHavestingsModule,
    AnimalTypesModule,
    IncubationsModule,
    AssignTypesModule,
    IsolationsModule,
    FatteningsModule,
    FarrowingsModule,
    FeedingsModule,
    FinanceModule,
    ActivityLogsModule,
    CurrenciesModule,
    ContributorsModule,
    OrganizationsModule,
    AuthProvidersModule,
    CheckPregnanciesModule,
  ],
})
export class AppModule {}
