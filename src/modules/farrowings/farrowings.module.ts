import { Module } from '@nestjs/common';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { AnimalsService } from '../animals/animals.service';
import { AssignTypesService } from '../assigne-type/assigne-type.service';
import { BreedingsService } from '../breedings/breedings.service';
import { GestationsService } from '../gestation/gestations.service';
import { ImagesService } from '../images/images.service';
import { UploadsUtil } from '../integrations/integration.utils';
import { LocationsService } from '../locations/locations.service';
import { WeaningsService } from '../weaning/weaning.service';
import { FarrowingsController } from './farrowings.controller';
import { FarrowingsService } from './farrowings.service';

@Module({
  controllers: [FarrowingsController],
  providers: [
    UploadsUtil,
    AnimalsService,
    FarrowingsService,
    ActivityLogsService,
    AssignTypesService,
    GestationsService,
    LocationsService,
    ImagesService,
    WeaningsService,
    BreedingsService,
  ],
})
export class FarrowingsModule {}
