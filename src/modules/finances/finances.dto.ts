import { financialType } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
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
  details: string;

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
