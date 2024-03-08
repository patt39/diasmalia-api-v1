import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JsonWebTokenError } from 'jsonwebtoken';

@Injectable()
export class UserVeryryAuthGuard extends AuthGuard('jwt-user-verify') {
  handleRequest(err: any, user: any, info: any, context: any, status: any) {
    if (info instanceof JsonWebTokenError) {
      throw new UnauthorizedException(
        'Invalid token or expired please try again',
      );
    }

    return super.handleRequest(err, user, context, status);
  }
}
