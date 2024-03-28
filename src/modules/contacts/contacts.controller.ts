import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { reply } from '../../app/utils/reply';

import { RequestPaginationDto } from '../../app/utils/pagination/request-pagination.dto';
import {
  addPagination,
  PaginationType,
} from '../../app/utils/pagination/with-pagination';
import { SearchQueryDto } from '../../app/utils/search-query/search-query.dto';
import { contactNotification } from '../users/mails/contact-notification';
import { UserAuthGuard } from '../users/middleware';
import { UsersService } from '../users/users.service';
import { CreateOrUpdateContactsDto } from './contacts.dto';
import { ContactsService } from './contacts.service';

@Controller('contacts')
export class ContactsController {
  constructor(
    private readonly contactsService: ContactsService,
    private readonly usersService: UsersService,
  ) {}

  /** Get all Contacts */
  @Get(`/`)
  async findAll(
    @Res() res,
    @Query() requestPaginationDto: RequestPaginationDto,
    @Query() searchQuery: SearchQueryDto,
  ) {
    const { search } = searchQuery;

    const { take, page, sort } = requestPaginationDto;
    const pagination: PaginationType = addPagination({ page, take, sort });

    const contacts = await this.contactsService.findAll({
      search,
      pagination,
    });

    return reply({ res, results: contacts });
  }

  /** Post one Contact */
  @Post(`/`)
  @UseGuards(UserAuthGuard)
  async createOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateContactsDto,
  ) {
    const { user } = req;
    const { subject, description } = body;

    if (user) {
      await this.contactsService.createOne({
        subject,
        description,
        userCreatedId: user?.id,
        organizationId: user?.organizationId,
      });

      await contactNotification({ email: user?.email, user });
    } else {
      throw new HttpException(`user doesn't exists`, HttpStatus.NOT_FOUND);
    }

    return reply({ res, results: 'Contact send' });
  }

  /** Get one Contact */
  @Get(`/show/:contactId`)
  @UseGuards(UserAuthGuard)
  async getOneByIdUser(
    @Res() res,
    @Param('contactId', ParseUUIDPipe) contactId: string,
  ) {
    const user = await this.contactsService.findOneBy({ contactId });

    return reply({ res, results: user });
  }

  /** Delete one Contact */
  @Delete(`/delete/:contactId`)
  @UseGuards(UserAuthGuard)
  async deleteOne(
    @Res() res,
    @Param('contactId', ParseUUIDPipe) contactId: string,
  ) {
    const contact = await this.contactsService.updateOne(
      { contactId },
      { deletedAt: new Date() },
    );

    return reply({ res, results: contact });
  }
}
