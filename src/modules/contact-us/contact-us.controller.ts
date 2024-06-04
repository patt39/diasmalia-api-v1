import {
  Body,
  Controller,
  Delete,
  Get,
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
import { CreateOrUpdateContactUsDto } from './contact-us.dto';
import { ContactUsService } from './contact-us.service';

@Controller('contact-us')
export class ContactUsController {
  constructor(private readonly contactUsService: ContactUsService) {}

  /** Get all Contact Us */
  @Get(`/`)
  async findAll(
    @Res() res,
    @Query() requestPaginationDto: RequestPaginationDto,
    @Query() searchQuery: SearchQueryDto,
  ) {
    const { search } = searchQuery;

    const { take, page, sort, sortBy } = requestPaginationDto;
    const pagination: PaginationType = addPagination({
      page,
      take,
      sort,
      sortBy,
    });

    const contactUs = await this.contactUsService.findAll({
      search,
      pagination,
    });

    return reply({ res, results: contactUs });
  }

  /** Post one Contact Us */
  @Post(`/`)
  @UseGuards(UserAuthGuard)
  async createOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateContactUsDto,
  ) {
    const { user } = req;
    const { email, phone, fullName, subject, description } = body;

    await this.contactUsService.createOne({
      email,
      phone,
      subject,
      fullName,
      description,
    });

    await contactNotification({ email: user?.email, user });
    return reply({ res, results: 'Contact send' });
  }

  /** Get one Contact Us */
  @Get(`/show/:contactUsId`)
  @UseGuards(UserAuthGuard)
  async getOneByIdUser(
    @Res() res,
    @Param('contactUsId', ParseUUIDPipe) contactUsId: string,
  ) {
    const user = await this.contactUsService.findOneBy({ contactUsId });

    return reply({ res, results: user });
  }

  /** Delete one Contact Us */
  @Delete(`/delete/:contactUsId`)
  @UseGuards(UserAuthGuard)
  async deleteOne(
    @Res() res,
    @Param('contactUsId', ParseUUIDPipe) contactUsId: string,
  ) {
    const contact = await this.contactUsService.updateOne(
      { contactUsId },
      { deletedAt: new Date() },
    );

    return reply({ res, results: contact });
  }
}
