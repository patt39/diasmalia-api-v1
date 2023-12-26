import { MethodBreeding } from '@prisma/client';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsIn,
  IsUUID,
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
  @IsIn([MethodBreeding])
  method: MethodBreeding;

  @IsNotEmpty()
  @IsString()
  @IsUUID()
  animalId: string;
}
