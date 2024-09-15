import { MethodBreeding } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateBreedingsDto {
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
}

export class UpdateBreedingsDto {
  @IsOptional()
  @IsString()
  codeMale: string;

  @IsOptional()
  @IsString()
  codeFemale: string;

  @IsOptional()
  @IsString()
  note: string;

  @IsOptional()
  @IsString()
  @IsEnum(MethodBreeding)
  method: MethodBreeding;
}

export class GetAnimalBreedingsDto {
  @IsOptional()
  @IsString()
  animalId: string;
}

export class GetAnimalBreedingsQueryDto {
  @IsOptional()
  @IsString()
  periode: string;

  @IsOptional()
  @IsString()
  @IsEnum(MethodBreeding)
  method: MethodBreeding;

  @IsOptional()
  @IsString()
  @IsUUID()
  animalTypeId: string;
}
