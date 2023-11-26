import { Module } from '@nestjs/common';
import { DatabaseModule } from './app/database/database.module';
import { ProductsModule } from './modules/products/products.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { ContactUsModule } from './modules/contact-us/contact-us.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';

@Module({
  imports: [
    DatabaseModule,
    ProductsModule,
    ReviewsModule,
    ContactUsModule,
    ProfilesModule,
    OrganizationsModule,
  ],
})
export class AppModule {}
