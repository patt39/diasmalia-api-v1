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
  @IsInt()
  number: number;

  @IsNotEmpty()
  @IsString()
  @IsEnum(AnimalType)
  type: AnimalType;

  @IsNotEmpty()
  @IsString()
  @IsEnum(ProductionPhase)
  productionPhase: ProductionPhase;
}
export class GetLocationsByType {
  @IsOptional()
  @IsString()
  @IsEnum(AnimalType)
  type: AnimalType;
}
export class GetLocationsByPhase {
  @IsOptional()
  @IsString()
  @IsEnum(ProductionPhase)
  productionPhase: ProductionPhase;
}
