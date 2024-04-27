import { MethodBreeding } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateOrUpdateBreedingsDto {
  @IsNotEmpty()
  @IsString()
  date: Date;

  @IsNotEmpty()
  @IsString()
  codeMale: string;

  @IsNotEmpty()
  @IsString()
  codeFemale: string;

  @IsOptional()
  @IsString()
  note: string;

  @IsNotEmpty()
  @IsString()
  @IsEnum(MethodBreeding)
  method: MethodBreeding;

  @IsNotEmpty()
  @IsString()
  @IsUUID()
  animalTypeId: string;
}

export class GetAnimalBreedingsDto {
  @IsOptional()
  @IsString()
  animalId: string;
}

export class GetAnimalBreedingsQueryDto {
  @IsOptional()
  @IsString()
  @IsEnum(MethodBreeding)
  method: MethodBreeding;

  @IsOptional()
  @IsString()
  @IsUUID()
  animalTypeId: string;
}
