import { Injectable } from '@nestjs/common';
import { ContributorsService } from './contributors.service';

@Injectable()
export class ContributorsUtil {
  constructor(private readonly contributorsService: ContributorsService) {}

  /** Get one Authorization to the database. */
  async getAuthorizationToContributor(options: {
    userId: string;
    organizationId: string;
  }): Promise<any> {
    const { userId, organizationId } = options;
    if (userId) {
      const contributor = await this.contributorsService.findOneBy({
        userId,
        organizationId,
      });
      return { contributor };
    }

    console.log('');
    return null;
  }
}
