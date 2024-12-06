import { Injectable } from '@nestjs/common';
import { Prisma, Suggestion } from '@prisma/client';
import { DatabaseService } from '../../app/database/database.service';
import {
  withPagination,
  WithPaginationResponse,
} from '../../app/utils/pagination';
import {
  CreateSuggestionsOptions,
  GetOneSuggestionSelections,
  GetSuggestionsSelections,
  SuggestionSelect,
  UpdateSuggestionsOptions,
  UpdateSuggestionsSelections,
} from './suggestions.type';

@Injectable()
export class SuggestionService {
  constructor(private readonly client: DatabaseService) {}

  async findAll(
    selections: GetSuggestionsSelections,
  ): Promise<WithPaginationResponse | null> {
    const prismaWhere = {} as Prisma.SuggestionWhereInput;
    const { pagination, userId, organizationId } = selections;

    if (userId) {
      Object.assign(prismaWhere, { userId });
    }

    if (organizationId) {
      Object.assign(prismaWhere, { organizationId });
    }

    const suggestions = await this.client.suggestion.findMany({
      where: { ...prismaWhere, deletedAt: null },
      take: pagination.take,
      skip: pagination.skip,
      select: SuggestionSelect,
      orderBy: pagination.orderBy,
    });

    const rowCount = await this.client.suggestion.count({
      where: { ...prismaWhere, deletedAt: null },
    });

    return withPagination({
      pagination,
      rowCount,
      value: suggestions,
    });
  }

  /** Find one material in database. */
  async findOneBy(selections: GetOneSuggestionSelections) {
    const prismaWhere = {} as Prisma.SuggestionWhereInput;

    const { suggestionId, organizationId } = selections;

    if (suggestionId) {
      Object.assign(prismaWhere, { id: suggestionId });
    }

    if (organizationId) {
      Object.assign(prismaWhere, { organizationId });
    }

    const material = await this.client.suggestion.findFirst({
      where: { ...prismaWhere, deletedAt: null },
    });

    return material;
  }

  /** Create one material in database. */
  async createOne(options: CreateSuggestionsOptions): Promise<Suggestion> {
    const { title, message, userId, animalId, organizationId } = options;

    const suggestion = this.client.suggestion.create({
      data: {
        title,
        message,
        userId,
        animalId,
        organizationId,
      },
    });

    return suggestion;
  }

  /** Update one suggestion in database. */
  async updateOne(
    selections: UpdateSuggestionsSelections,
    options: UpdateSuggestionsOptions,
  ): Promise<Suggestion> {
    const { suggestionId } = selections;
    const { deletedAt } = options;

    const suggestion = this.client.suggestion.update({
      where: { id: suggestionId },
      data: {
        deletedAt,
      },
    });

    return suggestion;
  }
}
