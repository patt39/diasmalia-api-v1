import { Suggestion } from '@prisma/client';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetSuggestionsSelections = {
  pagination?: PaginationType;
  userId: string;
  organizationId: string;
};

export type GetOneSuggestionSelections = {
  suggestionId?: Suggestion['id'];
  organizationId?: Suggestion['organizationId'];
};

export type UpdateSuggestionsSelections = {
  suggestionId: Suggestion['id'];
};

export type CreateSuggestionsOptions = Partial<Suggestion>;

export type UpdateSuggestionsOptions = Partial<Suggestion>;

export const SuggestionSelect = {
  createdAt: true,
  id: true,
  title: true,
  message: true,
  animalId: true,
  animal: { select: { code: true } },
  organizationId: true,
};
