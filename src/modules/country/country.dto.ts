import { IsOptional, IsString } from 'class-validator';

export class CreateOrUpdateCurrenciesDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  symbol: string;

  @IsOptional()
  @IsString()
  status: string;
}
