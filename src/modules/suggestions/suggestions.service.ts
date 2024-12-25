import { Injectable } from '@nestjs/common';
import { Prisma, Suggestion } from '@prisma/client';
import { DatabaseService } from '../../app/database/database.service';
import {
  withPagination,
  WithPaginationResponse,
} from '../../app/utils/pagination';
import { AssignTypesService } from '../assigne-type/assigne-type.service';
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
  constructor(
    private readonly client: DatabaseService,
    private readonly assignedTypesService: AssignTypesService,
  ) {}

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

  /** Suggestions job service. */
  async jobService(options: CreateSuggestionsOptions): Promise<void> {
    const { userId, organizationId } = options;

    const assigneTypes = await this.client.assignType.findMany({
      where: {
        userId: userId,
        organizationId: organizationId,
      },
    });

    for (const type of assigneTypes) {
      const findOneType = await this.assignedTypesService.findOneBy({
        animalTypeId: type.animalTypeId,
      });
      if (
        ['Porciculture', 'Cuniculture', 'Caprins', 'Ovins', 'Bovins'].includes(
          findOneType?.animalType?.name,
        )
      ) {
        await this.createOne({
          title: `Caractéristiques d'un bon élevage de mammifère`,
          message: `Les poules vont bientot entrer en ponte  passer à l'aliment ponte exclussivement avec Calcium élevé (3,5-4%) : Indispensable pour des coquilles solides. Protéines (16-17%) : Maintenir un bon développement corporel et la production d'œufs. Phosphore et oligo-éléments : Soutenir la santé osseuse et la ponte. Fournir des grains concassés ou des granulés pour éviter les pertes. Veiller à une hydratation constante avec de l'eau propre. 
          Maintenir 16 heures de lumière par jour pour stimuler la ponte.Assurer une lumière homogène et sans fluctuations tout en maintenant la temperature idéalement entre 18 et 24°C pour éviter le stress thermique`,
          userId: userId,
          organizationId: organizationId,
        });
      }
    }

    console.log('Job completed!');
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
