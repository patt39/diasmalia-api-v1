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
import { SellingsService } from './sellings.service';
import { SearchQueryDto } from '../../app/utils/search-query/search-query.dto';
import { CreateOrUpdateSellingsDto } from './sellings.dto';
import { RequestPaginationDto } from '../../app/utils/pagination/request-pagination.dto';
import {
  addPagination,
  PaginationType,
} from '../../app/utils/pagination/with-pagination';
import { JwtAuthGuard } from '../users/middleware';

@Controller('gestations')
export class SellingsController {
  constructor(private readonly sellingsService: SellingsService) {}

  /** Get all Selling */
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

    const sellings = await this.sellingsService.findAll({
      search,
      pagination,
      organizationId: user?.organizationId,
    });

    return reply({ res, results: sellings });
  }

  /** Post one Selling */
  @Post(`/`)
  @UseGuards(JwtAuthGuard)
  async createOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateSellingsDto,
  ) {
    const { user } = req;
    const { note, price, date, animalId, method } = body;
    const selling = await this.sellingsService.createOne({
      note,
      price,
      date,
      animalId,
      method,
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
    });

    return reply({ res, results: selling });
  }

  /** Update one Selling */
  @Put(`/:sellingId`)
  @UseGuards(JwtAuthGuard)
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateSellingsDto,
    @Param('sellingId', ParseUUIDPipe) sellingId: string,
  ) {
    const { user } = req;
    const { note, price, date, animalId, method } = body;

    const selling = await this.sellingsService.updateOne(
      { sellingId },
      {
        note,
        price,
        date,
        animalId,
        method,
        organizationId: user?.organizationId,
        userCreatedId: user?.id,
      },
    );

    return reply({ res, results: selling });
  }

  /** Get one Selling */
  @Get(`/view`)
  @UseGuards(JwtAuthGuard)
  async getOneByIdUser(
    @Res() res,
    @Query('sellingId', ParseUUIDPipe) sellingId: string,
  ) {
    const selling = await this.sellingsService.findOneBy({
      sellingId,
    });

    return reply({ res, results: selling });
  }

  /** Delete one Selling */
  @Delete(`/delete/:sellingId`)
  @UseGuards(JwtAuthGuard)
  async deleteOne(
    @Res() res,
    @Param('sellingId', ParseUUIDPipe) sellingId: string,
  ) {
    const selling = await this.sellingsService.updateOne(
      { sellingId },
      { deletedAt: new Date() },
    );

    return reply({ res, results: selling });
  }
}
