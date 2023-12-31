import { Module } from '@nestjs/common';
import { DatabaseModule } from './app/database/database.module';
import { ProductsModule } from './modules/products/products.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { ContactUsModule } from './modules/contact-us/contact-us.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { UsersModule } from './modules/users/users.module';
import { ContributorsModule } from './modules/contributors/contributors.module';
import { AuthProvidersModule } from './modules/auth-providers/auth-providers.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { MedicationsModule } from './modules/medications/medications.module';
import { LocationsModule } from './modules/locations/locations.module';
import { AnimalsModule } from './modules/animals/animals.module';
import { BreedsModule } from './modules/breeds/breeds.module';
import { TreatmentsModule } from './modules/treatments/treatments.module';
import { CheckPregnanciesModule } from './modules/check-pregnancies/check-pregnancies.module';
import { BreedingsModule } from './modules/breedings/breedings.module';
import { FarrowingsModule } from './modules/farrowings/farrowings.module';
import { AnimalStatusesModule } from './modules/animal-statuses/animal-statuses.module';
import { DiagnosisModule } from './modules/diagnosis/diagnosis.module';
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
    DiagnosisModule,
    BreedingsModule,
    TreatmentsModule,
    LocationsModule,
    FarrowingsModule,
    MedicationsModule,
    ContributorsModule,
    OrganizationsModule,
    AnimalStatusesModule,
    AuthProvidersModule,
    CheckPregnanciesModule,
  ],
})
export class AppModule {}
