import { MethodBreeding } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateOrUpdateBreedingsDto {
  @IsNotEmpty()
  @IsString()
  date: Date;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  note: string;

  @IsNotEmpty()
  @IsString()
  @IsEnum(MethodBreeding)
  method: MethodBreeding;

  @IsNotEmpty()
  @IsString()
  @IsUUID()
  animalId: string;
}
