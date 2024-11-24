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
import { AnimalsService } from '../animals/animals.service';
import { UserAuthGuard } from '../users/middleware';
import { CreateOrSuggestionDto } from './suggestions.dto';
import { SuggestionService } from './suggestions.service';

@Controller('suggestion')
export class SuggestionController {
  constructor(
    private readonly suggestionsService: SuggestionService,
    private readonly animalsService: AnimalsService,
  ) {}

  /** Get all suggestions */
  @Get(`/`)
  @UseGuards(UserAuthGuard)
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

    const suggestion = await this.suggestionsService.findAll({
      pagination,
    });

    return reply({ res, results: suggestion });
  }

  /** Post one suggestion */
  @Post(`/create`)
  @UseGuards(UserAuthGuard)
  async createOne(@Res() res, @Req() req, @Body() body: CreateOrSuggestionDto) {
    const { user } = req;
    const { message, code } = body;

    const findOneAnimal = await this.animalsService.findOneByCode({
      code,
      organizationId: user?.organizationId,
    });
    if (!findOneAnimal)
      throw new HttpException(
        `AnimalId: ${findOneAnimal?.id} doesn't exists please change`,
        HttpStatus.NOT_FOUND,
      );

    const suggestion = await this.suggestionsService.createOne({
      message,
      userId: user?.id,
      animalId: findOneAnimal?.id,
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
    @Param('materialId', ParseUUIDPipe) suggestionId: string,
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
