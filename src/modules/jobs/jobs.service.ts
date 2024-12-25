import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { SuggestionService } from '../suggestions/suggestions.service';

@Injectable()
export class JobRunner implements OnApplicationBootstrap {
  constructor(private readonly suggestionsService: SuggestionService) {}

  async onApplicationBootstrap(): Promise<void> {
    console.log('Triggering the one-time job...');
    // await this.suggestionsService.jobService();
  }
}
