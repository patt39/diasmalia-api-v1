import { Module } from '@nestjs/common';
import { AnimalsService } from '../animals/animals.service';
import { AssignTypesService } from '../assigne-type/assigne-type.service';
import { SuggestionController } from './suggestions.controller';
import { SuggestionService } from './suggestions.service';

@Module({
  controllers: [SuggestionController],
  providers: [SuggestionService, AnimalsService, AssignTypesService],
})
export class SuggestionsModule {}
