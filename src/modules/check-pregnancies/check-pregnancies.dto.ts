import { MethodCheckPregnancy, ResultCheckPregnancy } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateOrUpdateCheckPregnanciesDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  note: string;

  @IsNotEmpty()
  @IsString()
  farrowingDate: Date;

  @IsNotEmpty()
  @IsString()
  @IsUUID()
  breedingId: string;

  @IsNotEmpty()
  @IsString()
  @IsEnum(MethodCheckPregnancy)
  method: MethodCheckPregnancy;

  @IsNotEmpty()
  @IsString()
  @IsEnum(ResultCheckPregnancy)
  result: ResultCheckPregnancy;
}

export class checkPregancyQueryDto {
  @IsOptional()
  @IsString()
  @IsEnum(MethodCheckPregnancy)
  method: MethodCheckPregnancy;

  @IsOptional()
  @IsString()
  @IsEnum(ResultCheckPregnancy)
  result: ResultCheckPregnancy;

  @IsOptional()
  @IsString()
  @IsUUID()
  animalTypeId: string;
}
