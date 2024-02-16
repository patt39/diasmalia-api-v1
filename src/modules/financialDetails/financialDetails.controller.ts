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
  Put,
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
import { JwtAuthGuard } from '../users/middleware';
import { CreateOrUpdateFinancialDetailDto } from './financialDetails.dto';
import { FinancialDetailService } from './financialDetails.service';

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

    const findOneFinancialDetail = await this.financialDetailService.findOneBy({
      name,
      organizationId: user?.organizationId,
    });
    if (findOneFinancialDetail)
      throw new HttpException(
        `Detail ${name} already exists please change`,
        HttpStatus.NOT_FOUND,
      );

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

    const findOneFinancialDetail = await this.financialDetailService.findOneBy({
      financialDetailId,
    });
    if (!findOneFinancialDetail)
      throw new HttpException(
        `${financialDetailId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const financialDetail = await this.financialDetailService.updateOne(
      { financialDetailId: findOneFinancialDetail?.id },
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
    @Req() req,
    @Query('financialDetailId', ParseUUIDPipe) financialDetailId: string,
  ) {
    const { user } = req;
    const findOneFinancialDetail = await this.financialDetailService.findOneBy({
      financialDetailId,
      organizationId: user?.organizationId,
    });
    if (!findOneFinancialDetail)
      throw new HttpException(
        `${financialDetailId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    return reply({ res, results: findOneFinancialDetail });
  }

  /** Delete one financialDetail */
  @Delete(`/delete/:financialDetailId`)
  @UseGuards(JwtAuthGuard)
  async deleteOne(
    @Res() res,
    @Req() req,
    @Param('financialDetailId', ParseUUIDPipe) financialDetailId: string,
  ) {
    const { user } = req;

    const findOneFinancialDetail = await this.financialDetailService.findOneBy({
      financialDetailId,
      organizationId: user?.organizationId,
    });
    if (!findOneFinancialDetail)
      throw new HttpException(
        `${financialDetailId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );
    const financialDetail = await this.financialDetailService.updateOne(
      { financialDetailId: findOneFinancialDetail.id },
      { deletedAt: new Date() },
    );

    return reply({ res, results: financialDetail });
  }
}
