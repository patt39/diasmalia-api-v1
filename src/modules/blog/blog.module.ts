import { Module } from '@nestjs/common';
import { UploadsUtil } from '../integrations/integration.utils';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';

@Module({
  controllers: [BlogController],
  providers: [BlogService, UploadsUtil],
})
export class BlogsModule {}
