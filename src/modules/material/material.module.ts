import { Module } from '@nestjs/common';
import { ImagesService } from '../images/images.service';
import { UploadsUtil } from '../integrations/integration.utils';
import { MaterialController } from './material.controller';
import { MaterialService } from './material.service';

@Module({
  controllers: [MaterialController],
  providers: [MaterialService, UploadsUtil, ImagesService],
})
export class MaterialsModule {}
