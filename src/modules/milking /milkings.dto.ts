import { MethodMilking } from '@prisma/client';

import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateOrUpdateMilkingsDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  note: string;

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

  @IsNotEmpty()
  @IsString()
  @IsUUID()
  animalTypeId: string;
}

export class BulkMilkingsDto {
  @IsOptional()
  @IsString()
  note: string;

  @IsNotEmpty()
  @IsArray()
  animals: any;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsNotEmpty()
  @IsString()
  @IsEnum(MethodMilking)
  method: MethodMilking;

  @IsNotEmpty()
  @IsString()
  @IsUUID()
  animalTypeId: string;
}

export class GetMilkingsQueryDto {
  @IsNotEmpty()
  @IsString()
  @IsEnum(MethodMilking)
  method: MethodMilking;

  @IsNotEmpty()
  @IsString()
  @IsUUID()
  animalTypeId: string;
}
