import { Module } from '@nestjs/common';
import { DatabaseModule } from './app/database/database.module';
import { AnimalStatusesModule } from './modules/animal-statuses/animal-statuses.module';
import { AnimalsModule } from './modules/animals/animals.module';
import { AuthProvidersModule } from './modules/auth-providers/auth-providers.module';
import { BreedingsModule } from './modules/breedings/breedings.module';
import { BreedsModule } from './modules/breeds/breeds.module';
import { CheckPregnanciesModule } from './modules/check-pregnancies/check-pregnancies.module';
import { ContactUsModule } from './modules/contact-us/contact-us.module';
import { ContributorsModule } from './modules/contributors/contributors.module';
import { DeathsModule } from './modules/death/deaths.module';
import { DiagnosisModule } from './modules/diagnosis/diagnosis.module';
import { FarrowingsModule } from './modules/farrowings/farrowings.module';
import { FeedingsModule } from './modules/feeding/feedings.module';
import { FinancialDetailModule } from './modules/financialDetails/financialDetails.module';
import { FinancialMgtModule } from './modules/financialMgt/financialMgt.module';
import { GestationsModule } from './modules/gestation/gestations.module';
import { LocationsModule } from './modules/locations/locations.module';
import { MedicationsModule } from './modules/medications/medications.module';
import { MilkingsModule } from './modules/milking /milkings.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { ProductsModule } from './modules/products/products.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { SellingsModule } from './modules/selling/sellings.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { TreatmentsModule } from './modules/treatments/treatments.module';
import { UsersModule } from './modules/users/users.module';
import { WeaningsModule } from './modules/weaning/weaning.module';

@Module({
  imports: [
    DatabaseModule,
    ProductsModule,
    ReviewsModule,
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
    DiagnosisModule,
    BreedingsModule,
    TreatmentsModule,
    LocationsModule,
    SellingsModule,
    FarrowingsModule,
    FinancialMgtModule,
    MedicationsModule,
    ContributorsModule,
    OrganizationsModule,
    AnimalStatusesModule,
    AuthProvidersModule,
    FinancialDetailModule,
    CheckPregnanciesModule,
  ],
})
export class AppModule {}
