import { IsBoolean, IsOptional, IsString } from 'class-validator';

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
  @IsBoolean()
  status: boolean;
}
