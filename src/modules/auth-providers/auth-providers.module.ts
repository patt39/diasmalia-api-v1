import { Module } from '@nestjs/common';
import { AuthProvidersService } from './auth-providers.service';

@Module({
  controllers: [],
  providers: [AuthProvidersService],
})
export class AuthProvidersModule {}
