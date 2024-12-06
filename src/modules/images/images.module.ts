import { Module } from '@nestjs/common';
import { UploadsUtil } from '../integrations/integration.utils';
import { OrganizationsService } from '../organizations/organizations.service';
import { UsersService } from '../users/users.service';
import { ImagesController } from './images.controller';
import { ImagesService } from './images.service';

@Module({
  controllers: [ImagesController],
  providers: [ImagesService, UploadsUtil, OrganizationsService, UsersService],
})
export class ImagesModule {}
