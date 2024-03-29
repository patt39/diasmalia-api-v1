import { AnimalType, ProductionPhase } from '@prisma/client';
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
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsString()
  @IsEnum(AnimalType)
  type: AnimalType;

  @IsNotEmpty()
  @IsString()
  @IsEnum(ProductionPhase)
  productionPhase: ProductionPhase;
}
export class GetLocationsQueryDto {
  @IsOptional()
  @IsString()
  @IsEnum(AnimalType)
  type: AnimalType;

  @IsOptional()
  @IsString()
  @IsEnum(ProductionPhase)
  productionPhase: ProductionPhase;
}
