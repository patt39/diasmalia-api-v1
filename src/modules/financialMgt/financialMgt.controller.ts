import {
  Controller,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  Delete,
  Res,
  Req,
  Get,
  Query,
  UseGuards,
  Put,
} from '@nestjs/common';
import { reply } from '../../app/utils/reply';

import { FinancialMgtService } from './financialMgt.service';
import { SearchQueryDto } from '../../app/utils/search-query/search-query.dto';
import { CreateOrUpdateFinancialMgtDto } from './financialMgt.dto';
import { RequestPaginationDto } from '../../app/utils/pagination/request-pagination.dto';
import {
  addPagination,
  PaginationType,
} from '../../app/utils/pagination/with-pagination';
import { JwtAuthGuard } from '../users/middleware';

@Controller('financialMgt')
export class FinancialMgtController {
  constructor(private readonly financialMgtService: FinancialMgtService) {}

  /** Get all financialMgt */
  @Get(`/`)
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Res() res,
    @Req() req,
    @Query() requestPaginationDto: RequestPaginationDto,
    @Query() query: SearchQueryDto,
  ) {
    const { user } = req;
    const { search } = query;

    const { take, page, sort } = requestPaginationDto;
    const pagination: PaginationType = addPagination({ page, take, sort });

    const financialDetail = await this.financialMgtService.findAll({
      search,
      pagination,
      organizationId: user?.organizationId,
    });

    return reply({ res, results: financialDetail });
  }

  /** Post one FinancialMgt */
  @Post(`/`)
  @UseGuards(JwtAuthGuard)
  async createOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateFinancialMgtDto,
  ) {
    const { user } = req;
    const { date, note, amount, type, financialDetailId } = body;

    const financialMgt = await this.financialMgtService.createOne({
      date,
      note,
      amount,
      type,
      financialDetailId,
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
    });

    return reply({ res, results: financialMgt });
  }

  /** Post one financialMgt */
  @Put(`/:financialMgtId`)
  @UseGuards(JwtAuthGuard)
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateFinancialMgtDto,
    @Param('financialDetailId', ParseUUIDPipe) financialMgtId: string,
  ) {
    const { user } = req;
    const { date, note, amount, type, financialDetailId } = body;

    const financialMgt = await this.financialMgtService.updateOne(
      { financialMgtId },
      {
        date,
        note,
        amount,
        type,
        financialDetailId,
        organizationId: user?.organizationId,
        userCreatedId: user?.id,
      },
    );

    return reply({ res, results: financialMgt });
  }

  /** Get one financialMgt */
  @Get(`/view`)
  @UseGuards(JwtAuthGuard)
  async getOneByIdUser(
    @Res() res,
    @Query('financialMgtId', ParseUUIDPipe) financialMgtId: string,
  ) {
    const financialMgt = await this.financialMgtService.findOneBy({
      financialMgtId,
    });

    return reply({ res, results: financialMgt });
  }

  /** Delete one financialMgt */
  @Delete(`/delete/:financialMgtId`)
  @UseGuards(JwtAuthGuard)
  async deleteOne(
    @Res() res,
    @Param('financialMgtId', ParseUUIDPipe) financialMgtId: string,
  ) {
    const financialMgt = await this.financialMgtService.updateOne(
      { financialMgtId },
      { deletedAt: new Date() },
    );

    return reply({ res, results: financialMgt });
  }
}
