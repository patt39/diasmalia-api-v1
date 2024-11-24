import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateOrUpdateFinancesDto {
  @IsOptional()
  @IsString()
  detail: string;

  @IsNotEmpty()
  @IsInt()
  amount: number;

  @IsNotEmpty()
  @IsString()
  type: string;
}

export class GetFinancesByType {
  @IsOptional()
  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  periode: string;
}
