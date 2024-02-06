import { AnimalType, ProductionPhase } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
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
  @MaxLength(100)
  @IsEnum(ProductionPhase)
  productionPhase: ProductionPhase;
}
