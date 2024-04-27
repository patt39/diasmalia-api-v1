import { ProductionPhase } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
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

  @IsOptional()
  @IsString()
  @IsEnum(ProductionPhase)
  productionPhase: ProductionPhase;

  @IsNotEmpty()
  @IsString()
  @IsUUID()
  animalTypeId: string;
}
export class GetLocationsQueryDto {
  @IsOptional()
  @IsString()
  @IsEnum(ProductionPhase)
  productionPhase: ProductionPhase;

  @IsOptional()
  @IsString()
  @IsUUID()
  animalTypeId: string;
}
