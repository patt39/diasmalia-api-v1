import { Module } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';

@Module({
  controllers: [ContactsController],
  providers: [ContactsService, UsersService],
})
export class ContactsModule {}
