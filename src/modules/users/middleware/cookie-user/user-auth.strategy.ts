import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { config } from '../../../../app/config';
import { UsersService } from '../../users.service';
import { JwtToken } from '../check-user.service';

@Injectable()
export class UserAuthStrategy extends PassportStrategy(
  Strategy,
  'jwt-user-token',
) {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        UserAuthStrategy.extractJwt,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: config.cookieKey,
    });
  }

  private static extractJwt(req: Request): string | null {
    if (
      req.cookies &&
      config.cookie_access.user.nameLogin in req.cookies &&
      req.cookies[config.cookie_access.user.nameLogin].length > 0
    ) {
      return req.cookies[config.cookie_access.user.nameLogin];
    }
    return null;
  }

  async validate(payload: JwtToken): Promise<any> {
    const user = await this.usersService.findOneBy({ userId: payload?.userId });
    if (!user) throw new UnauthorizedException('Invalid user');

    return user;
  }
}
