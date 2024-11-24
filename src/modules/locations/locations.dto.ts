import { AddCages } from '@prisma/client';
import {
  IsArray,
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateOrUpdateLocationsDto {
  @IsOptional()
  @IsNumber()
  squareMeter: number;

  @IsOptional()
  @IsNumber()
  manger: number;

  @IsOptional()
  @IsNumber()
  through: number;

  @IsOptional()
  @IsNumber()
  cages: number;

  @IsOptional()
  @IsNumber()
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

  @IsOptional()
  @IsString()
  buildingCode: string;
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
  number: number;

  @IsOptional()
  @IsString()
  buildingCode: string;

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
  @IsUUID()
  buildingId: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  organizationId: string;

  @IsOptional()
  @IsString()
  @IsIn(['true', 'false'])
  status: string;

  @IsOptional()
  @IsString()
  @IsEnum(AddCages)
  addCages: AddCages;
}
