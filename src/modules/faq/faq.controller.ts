import {
  Body,
  Controller,
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
import { UserAuthGuard } from '../users/middleware';
import { CreateOrUpdateFaqsDto } from './faq.dto';
import { FaqsService } from './faq.service';

@Controller('faqs')
export class FaqsController {
  constructor(private readonly faqsService: FaqsService) {}

  /** Get all Faqs */
  @Get(`/`)
  async findAll(
    @Res() res,
    @Query() requestPaginationDto: RequestPaginationDto,
  ) {
    const { take, page, sort, sortBy } = requestPaginationDto;
    const pagination: PaginationType = addPagination({
      page,
      take,
      sort,
      sortBy,
    });

    const faqs = await this.faqsService.findAll({
      pagination,
    });

    return reply({ res, results: faqs });
  }

  /** Post one Faq */
  @Post(`/create`)
  @UseGuards(UserAuthGuard)
  async createOne(@Res() res, @Req() req, @Body() body: CreateOrUpdateFaqsDto) {
    const { user } = req;
    const { title, description } = body;

    await this.faqsService.createOne({
      title,
      description,
      userCreatedId: user?.id,
    });

    return reply({ res, results: 'Faq created successfully' });
  }

  /** Update one Faq */
  @Get(`/:faqId/edit`)
  @UseGuards(UserAuthGuard)
  async getOneByIdUser(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateFaqsDto,
    @Param('faqId', ParseUUIDPipe) faqId: string,
  ) {
    const { user } = req;

    const { title, description } = body;

    const faq = await this.faqsService.findOneBy({ faqId });

    await this.faqsService.updateOne(
      { faqId: faq?.id },
      {
        title,
        description,
        userCreatedId: user?.id,
      },
    );

    return reply({ res, results: faq });
  }
}
