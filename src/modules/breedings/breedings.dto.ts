import { MethodBreeding } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
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
  @MaxLength(100)
  note: string;

  @IsNotEmpty()
  @IsString()
  @IsEnum(MethodBreeding)
  method: MethodBreeding;
}

export class GetAnimalBreedingsDto {
  @IsOptional()
  @IsString()
  animalId: string;
}

export class GetAnimalBreedingsByMethodDto {
  @IsOptional()
  @IsString()
  @IsEnum(MethodBreeding)
  method: MethodBreeding;
}
