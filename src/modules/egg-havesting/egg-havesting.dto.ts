import { Size } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateEggHavestingsDto {
  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsNotEmpty()
  @IsString()
  @IsEnum(Size)
  size: Size;

  @IsNotEmpty()
  @IsString()
  code: string;
}

export class UpdateEggHavestingsDto {
  @IsOptional()
  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsString()
  @IsEnum(Size)
  size: Size;

  @IsOptional()
  @IsString()
  code: string;
}

export class EggHavestingQueryDto {
  @IsOptional()
  @IsString()
  periode: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  animalTypeId: string;
}
