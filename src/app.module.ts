import { Module } from '@nestjs/common';
import { DatabaseModule } from './app/database/database.module';
import { ProductsModule } from './modules/products/products.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { ContactUsModule } from './modules/contact-us/contact-us.module';
import { ProfilesModule } from './modules/profiles/profiles.module';

@Module({
  imports: [
    DatabaseModule,
    ProductsModule,
    ReviewsModule,
    ContactUsModule,
    ProfilesModule,
  ],
})
export class AppModule {}
