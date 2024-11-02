import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Put,
  Query,
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
import { UserAuthGuard } from '../users/middleware';
import { CountriesService } from './country.service';

@Controller('countries')
export class CountriesController {
  constructor(private readonly contriesService: CountriesService) {}

  /** Get all Countries */
  @Get(`/`)
  @UseGuards(UserAuthGuard)
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

    const countries = await this.contriesService.findAll({
      search,
      pagination,
    });

    return reply({ res, results: countries });
  }

  /** Enable status currency */
  @Put(`/:countryId/change-status`)
  @UseGuards(UserAuthGuard)
  async enableCountry(
    @Res() res,
    @Param('countryId', ParseUUIDPipe) countryId: string,
  ) {
    const findCountry = await this.contriesService.findOneBy({
      countryId,
    });
    if (!findCountry)
      throw new HttpException(
        `CountryId: ${countryId} doesn't exists, please change`,
        HttpStatus.NOT_FOUND,
      );

    await this.contriesService.updateOne(
      { countryId: findCountry.id },
      { status: !findCountry.status },
    );

    return reply({ res, results: 'Status updated successfully' });
  }
}
