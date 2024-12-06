import {
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseUUIDPipe,
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
import { GetSuggestionsQueryDto } from './suggestions.dto';
import { SuggestionService } from './suggestions.service';

@Controller('suggestions')
export class SuggestionController {
  constructor(private readonly suggestionsService: SuggestionService) {}

  /** Get all suggestions */
  @Get(`/`)
  @UseGuards(UserAuthGuard)
  async findAll(
    @Res() res,
    @Req() req,
    @Query() requestPaginationDto: RequestPaginationDto,
    @Query() suggestionQueryDto: GetSuggestionsQueryDto,
  ) {
    const { take, page, sort, sortBy } = requestPaginationDto;
    const { user } = req;
    const { userId } = suggestionQueryDto;
    const pagination: PaginationType = addPagination({
      page,
      take,
      sort,
      sortBy,
    });

    const suggestion = await this.suggestionsService.findAll({
      userId,
      pagination,
      organizationId: user?.organizationId,
    });

    return reply({ res, results: suggestion });
  }

  /** Delete one suggestion */
  @Delete(`/:suggestionId/delete`)
  @UseGuards(UserAuthGuard)
  async deleteOne(
    @Res() res,
    @Req() req,
    @Param('suggestionId', ParseUUIDPipe) suggestionId: string,
  ) {
    const { user } = req;
    const findOneSuggestion = await this.suggestionsService.findOneBy({
      suggestionId,
      organizationId: user?.organizationId,
    });
    if (!findOneSuggestion)
      throw new HttpException(
        `SuggestionId: ${suggestionId} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    await this.suggestionsService.updateOne(
      { suggestionId: findOneSuggestion?.id },
      { deletedAt: new Date() },
    );

    return reply({ res, results: 'Suggestion deleted successfully' });
  }
}
