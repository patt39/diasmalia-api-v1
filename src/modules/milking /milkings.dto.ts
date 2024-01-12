import { MethodMilking } from '@prisma/client';

import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsUUID,
  IsEnum,
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
  @IsString()
  @MaxLength(100)
  quantity: number;

  @IsNotEmpty()
  @IsString()
  @IsUUID()
  animalId: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @IsEnum(MethodMilking)
  method: MethodMilking;
}
