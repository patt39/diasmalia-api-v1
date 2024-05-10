import { AnimalStatus } from '@prisma/client';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateOrUpdateDeathsDto {
  @IsOptional()
  @IsString()
  note: string;

  @IsNotEmpty()
  @IsString()
  codeAnimal: string;

  @IsOptional()
  @IsString()
  @IsEnum(AnimalStatus)
  status: AnimalStatus;

  @IsNotEmpty()
  @IsNumber()
  number: number;

  @IsNotEmpty()
  @IsString()
  @IsUUID()
  animalTypeId: string;
}

export class BulkDeathsDto {
  @IsOptional()
  @IsString()
  note: string;

  @IsNotEmpty()
  @IsArray()
  animals: any;

  @IsNotEmpty()
  @IsString()
  @IsUUID()
  animalTypeId: string;
}

export class DeathQueryDto {
  @IsOptional()
  @IsString()
  @IsUUID()
  animalTypeId: string;
}
