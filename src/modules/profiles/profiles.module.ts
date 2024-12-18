import { Module } from '@nestjs/common';
import { CountriesService } from '../country/country.service';
import { CurrenciesService } from '../currency/currency.service';
import { ImagesService } from '../images/images.service';
import { UploadsUtil } from '../integrations/integration.utils';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';

@Module({
  controllers: [ProfilesController],
  providers: [
    ProfilesService,
    UploadsUtil,
    ImagesService,
    CurrenciesService,
    CountriesService,
  ],
})
export class ProfilesModule {}
