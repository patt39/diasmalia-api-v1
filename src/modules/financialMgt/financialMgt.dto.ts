import { financialType } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateOrUpdateFinancialMgtDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  note: string;

  @IsNotEmpty()
  @IsInt()
  amount: number;

  @IsNotEmpty()
  @IsString()
  date: Date;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @IsEnum(financialType)
  type: financialType;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @IsUUID()
  financialDetailId: string;
}
