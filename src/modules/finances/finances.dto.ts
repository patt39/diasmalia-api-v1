import { financeType } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateOrUpdateFinancesDto {
  @IsOptional()
  @IsString()
  detail: string;

  @IsNotEmpty()
  @IsInt()
  amount: number;

  @IsNotEmpty()
  @IsString()
  @IsEnum(financeType)
  type: financeType;
}

export class GetFinancesByType {
  @IsOptional()
  @IsString()
  @IsEnum(financeType)
  type: financeType;

  @IsOptional()
  @IsString()
  periode: string;
}
