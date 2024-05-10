import { Module } from '@nestjs/common';
import { CurrenciesService } from '../currency/currency.service';
import { UploadsUtil } from '../integrations/integration.utils';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';

@Module({
  controllers: [ProfilesController],
  providers: [ProfilesService, UploadsUtil, CurrenciesService],
})
export class ProfilesModule {}
