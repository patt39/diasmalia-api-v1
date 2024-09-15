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

  @IsOptional()
  @IsInt()
  manger: number;

  @IsOptional()
  @IsInt()
  through: number;

  @IsOptional()
  @IsInt()
  nest: number;

  @IsOptional()
  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  @IsEnum(ProductionPhase)
  productionPhase: ProductionPhase;
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
