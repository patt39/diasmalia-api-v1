import { MethodMilking } from '@prisma/client';

import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateOrUpdateMilkingsDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  note: string;

  @IsNotEmpty()
  @IsString()
  date: Date;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  femaleCode: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @IsEnum(MethodMilking)
  method: MethodMilking;
}

export class BulkMilkingsDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  note: string;

  @IsNotEmpty()
  @IsString()
  date: Date;

  @IsNotEmpty()
  @IsArray()
  animals: any;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @IsEnum(MethodMilking)
  method: MethodMilking;
}

export class GetMilkingsByMethod {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @IsEnum(MethodMilking)
  method: MethodMilking;
}
