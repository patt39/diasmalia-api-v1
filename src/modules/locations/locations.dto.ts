import { BirdType } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateOrUpdateLocationsDto {
  @IsNotEmpty()
  @IsInt()
  squareMeter: number;

  @IsNotEmpty()
  @IsInt()
  manger: number;

  @IsNotEmpty()
  @IsInt()
  through: number;

  @IsNotEmpty()
  @IsInt()
  number: number;

  @IsNotEmpty()
  @IsString()
  @IsEnum(BirdType)
  type: BirdType;
}
export class GetLocationsQueryDto {
  @IsOptional()
  @IsString()
  @IsEnum(BirdType)
  type: BirdType;
}
