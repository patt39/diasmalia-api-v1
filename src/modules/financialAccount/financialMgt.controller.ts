import { Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { reply } from '../../app/utils/reply';
import { FinancialAccountService } from '../financialAccount/financialAccount.service';
import { JwtAuthGuard } from '../users/middleware';
@Controller('financialMgt')
export class FinancialMgtController {
  constructor(
    private readonly financialAccountService: FinancialAccountService,
  ) {}

  /** Post one FinancialMgt */
  @Post(`/`)
  @UseGuards(JwtAuthGuard)
  async createOne(@Res() res, @Req() req) {
    const { user } = req;

    const financialAccount = await this.financialAccountService.createOne({
      organizationId: user?.organizationId,
      userCreatedId: user?.id,
    });

    return reply({ res, results: financialAccount });
  }
}
