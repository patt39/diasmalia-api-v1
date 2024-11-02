import { AddCages } from '@prisma/client';
import {
  IsArray,
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
  cages: number;

  @IsOptional()
  @IsInt()
  nest: number;

  @IsOptional()
  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  productionPhase: string;

  @IsOptional()
  @IsString()
  @IsEnum(AddCages)
  addCages: AddCages;
}

export class AnimalChangeLocationsDto {
  @IsNotEmpty()
  @IsString()
  locationCode: string;

  @IsNotEmpty()
  @IsArray()
  animals: any;
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
  productionPhase: string;
}

export class GetLocationsQueryDto {
  @IsOptional()
  @IsString()
  productionPhase: string;

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
  @IsEnum(AddCages)
  addCages: AddCages;
}
