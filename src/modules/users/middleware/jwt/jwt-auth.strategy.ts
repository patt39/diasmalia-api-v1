import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { config } from '../../../../app/config';
import { ContributorsUtil } from '../../../contributors/contributors.util';
import { UsersService } from '../../users.service';

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly usersService: UsersService,
    private readonly contributorsUtil: ContributorsUtil,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.jwt.secret,
    });
  }

  async validate(payload): Promise<any> {
    const user = await this.usersService.findOneBy({ userId: payload?.id });
    if (!user) throw new UnauthorizedException('Invalid user');

    /** Check permission contributor */
    const { contributor } =
      await this.contributorsUtil.getAuthorizationToContributor({
        userId: user?.id,
      });
    if (!contributor) throw new UnauthorizedException('Invalid organization');

    return user;
  }
}
