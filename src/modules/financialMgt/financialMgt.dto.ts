import { financialType } from '@prisma/client';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsUUID,
  IsEnum,
  IsInt,
  IsDate,
} from 'class-validator';

export class CreateOrUpdateFinancialMgtDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  note: string;

  @IsNotEmpty()
  @IsInt()
  @MaxLength(100)
  amount: number;

  @IsNotEmpty()
  @IsDate()
  @MaxLength(100)
  date: Date;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @IsEnum(financialType)
  type: financialType;

  @IsNotEmpty()
  @IsString()
  @IsUUID()
  financialDetailId: string;
}
