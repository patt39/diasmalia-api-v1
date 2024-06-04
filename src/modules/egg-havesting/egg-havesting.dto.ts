import { PickingMethod, Size } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateOrUpdateEggHavestingsDto {
  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsString()
  note: string;

  @IsNotEmpty()
  @IsString()
  @IsEnum(Size)
  size: Size;

  @IsOptional()
  @IsString()
  @IsEnum(PickingMethod)
  method: PickingMethod;

  @IsNotEmpty()
  @IsString()
  code: string;
}

export class EggHavestingQueryDto {
  @IsOptional()
  @IsString()
  @IsEnum(Size)
  size: Size;

  @IsOptional()
  @IsString()
  @IsEnum(PickingMethod)
  method: PickingMethod;

  @IsOptional()
  @IsString()
  @IsUUID()
  animalTypeId: string;
}
