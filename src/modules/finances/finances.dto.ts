import { financeType } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateOrUpdateFinancesDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  note: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  detail: string;

  @IsNotEmpty()
  @IsInt()
  amount: number;

  @IsNotEmpty()
  @IsString()
  date: Date;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @IsEnum(financeType)
  type: financeType;
}

export class GetFinancesByType {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @IsEnum(financeType)
  type: financeType;
}
