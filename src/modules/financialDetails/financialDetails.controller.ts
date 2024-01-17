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

import { FinancialDetailService } from './financialDetails.service';
import { SearchQueryDto } from '../../app/utils/search-query/search-query.dto';
import { CreateOrUpdateFinancialDetailDto } from './financialDetails.dto';
import { RequestPaginationDto } from '../../app/utils/pagination/request-pagination.dto';
import {
  addPagination,
  PaginationType,
} from '../../app/utils/pagination/with-pagination';
import { JwtAuthGuard } from '../users/middleware';

@Controller('financialDetails')
export class FinancialDetailController {
  constructor(
    private readonly financialDetailService: FinancialDetailService,
  ) {}

  /** Get all Diagnosis */
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

    const financialDetail = await this.financialDetailService.findAll({
      search,
      pagination,
      organizationId: user?.organizationId,
    });

    return reply({ res, results: financialDetail });
  }

  /** Post one FinancialDetail */
  @Post(`/`)
  @UseGuards(JwtAuthGuard)
  async createOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateFinancialDetailDto,
  ) {
    const { user } = req;
    const { name } = body;

    const medication = await this.financialDetailService.createOne({
      name,
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
    });

    return reply({ res, results: medication });
  }

  /** Post one financialDetail */
  @Put(`/:financialDetailId`)
  @UseGuards(JwtAuthGuard)
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateFinancialDetailDto,
    @Param('financialDetailId', ParseUUIDPipe) financialDetailId: string,
  ) {
    const { user } = req;
    const { name } = body;

    const financialDetail = await this.financialDetailService.updateOne(
      { financialDetailId },
      {
        name,
        organizationId: user?.organizationId,
        userCreatedId: user?.id,
      },
    );

    return reply({ res, results: financialDetail });
  }

  /** Get one financialDetail */
  @Get(`/view`)
  @UseGuards(JwtAuthGuard)
  async getOneByIdUser(
    @Res() res,
    @Query('financialDetailId', ParseUUIDPipe) financialDetailId: string,
  ) {
    const financialDetail = await this.financialDetailService.findOneBy({
      financialDetailId,
    });

    return reply({ res, results: financialDetail });
  }

  /** Delete one financialDetail */
  @Delete(`/delete/:financialDetailId`)
  @UseGuards(JwtAuthGuard)
  async deleteOne(
    @Res() res,
    @Param('financialDetailId', ParseUUIDPipe) financialDetailId: string,
  ) {
    const financialDetail = await this.financialDetailService.updateOne(
      { financialDetailId },
      { deletedAt: new Date() },
    );

    return reply({ res, results: financialDetail });
  }
}
