import { IsNotEmpty, IsString } from 'class-validator';

export class CreateOrUpdateCurrenciesDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsString()
  symbol: string;
}
