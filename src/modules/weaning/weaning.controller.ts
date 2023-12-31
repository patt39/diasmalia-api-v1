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

import { WeaningsService } from './weaning.service';
import { CreateOrUpdateWeaningsDto } from './weaning.dto';
import { RequestPaginationDto } from '../../app/utils/pagination/request-pagination.dto';
import { SearchQueryDto } from '../../app/utils/search-query/search-query.dto';
import {
  addPagination,
  PaginationType,
} from '../../app/utils/pagination/with-pagination';
import { JwtAuthGuard } from '../users/middleware';

@Controller('weanings')
export class WeaningsController {
  constructor(private readonly weaningsService: WeaningsService) {}

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

    const weanings = await this.weaningsService.findAll({
      search,
      pagination,
      organizationId: user?.organizationId,
    });

    return reply({ res, results: weanings });
  }

  /** Post one Animal status */
  @Post(`/`)
  @UseGuards(JwtAuthGuard)
  async createOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateWeaningsDto,
  ) {
    const { user } = req;
    const { litter, date, note, animalId } = body;
    const weaning = await this.weaningsService.createOne({
      litter,
      note,
      date,
      animalId,
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
    });

    return reply({ res, results: weaning });
  }

  /** Update one animal status */
  @Put(`/:weaningId`)
  @UseGuards(JwtAuthGuard)
  async updateOne(
    @Res() res,
    @Req() req,
    @Body() body: CreateOrUpdateWeaningsDto,
    @Param('weaningId', ParseUUIDPipe) weaningId: string,
  ) {
    const { litter, date, note, animalId } = body;

    const weaning = await this.weaningsService.updateOne(
      { weaningId },
      {
        litter,
        note,
        date,
        animalId,
      },
    );

    return reply({ res, results: weaning });
  }

  /** Get one animal status */
  @Get(`/view`)
  @UseGuards(JwtAuthGuard)
  async getOneByIdUser(
    @Res() res,
    @Query('weaningId', ParseUUIDPipe) weaningId: string,
  ) {
    const weaning = await this.weaningsService.findOneBy({
      weaningId,
    });

    return reply({ res, results: weaning });
  }

  /** Delete animal status*/
  @Delete(`/delete/:weaningId`)
  @UseGuards(JwtAuthGuard)
  async deleteOne(
    @Res() res,
    @Param('weaningId', ParseUUIDPipe) weaningId: string,
  ) {
    const weaning = await this.weaningsService.updateOne(
      { weaningId },
      { deletedAt: new Date() },
    );

    return reply({ res, results: weaning });
  }
}
