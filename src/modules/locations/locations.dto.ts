import { LocationType, ProductionPhase } from '@prisma/client';
import {
  IsEnum,
  IsIn,
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

  @IsOptional()
  @IsString()
  @IsEnum(LocationType)
  type: LocationType;
}

export class CreateBulkLocationsDto {
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
  @IsInt()
  number: number;

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

  @IsOptional()
  @IsString()
  @IsIn(['true', 'false'])
  status: string;

  @IsOptional()
  @IsString()
  @IsEnum(LocationType)
  type: LocationType;
}
