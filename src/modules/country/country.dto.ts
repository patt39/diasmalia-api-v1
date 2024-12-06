import { IsIn, IsOptional, IsString } from 'class-validator';

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

export class GetCountriesQueryDto {
  @IsOptional()
  @IsString()
  @IsIn(['true', 'false'])
  status: string;
}
