import { Controller, Get, Query, Req, Res, UseGuards } from '@nestjs/common';
import { reply } from '../../app/utils/reply';

import { RequestPaginationDto } from '../../app/utils/pagination/request-pagination.dto';
import {
  addPagination,
  PaginationType,
} from '../../app/utils/pagination/with-pagination';
import { SearchQueryDto } from '../../app/utils/search-query/search-query.dto';
import { UserAuthGuard } from '../users/middleware';
import { ActivityLogsService } from './activity-logs.service';
import { GetActivityLogsByPeriodeQuery } from './activity-logs.type';

@Controller('activity-logs')
export class ActivityLogsController {
  constructor(private readonly activitylogsService: ActivityLogsService) {}

  @Get(`/`)
  @UseGuards(UserAuthGuard)
  async findAll(
    @Res() res,
    @Req() req,
    @Query() requestPaginationDto: RequestPaginationDto,
    @Query() query: SearchQueryDto,
    @Query() queryPeriod: GetActivityLogsByPeriodeQuery,
  ) {
    const { user } = req;
    const { search } = query;
    const { periode, userId } = queryPeriod;

    const { take, page, sort, sortBy } = requestPaginationDto;
    const pagination: PaginationType = addPagination({
      page,
      take,
      sort,
      sortBy,
    });

    const activityLog = await this.activitylogsService.findAll({
      userId,
      search,
      pagination,
      periode: Number(periode),
      organizationId: user.organizationId,
    });

    return reply({ res, results: activityLog });
  }
}
