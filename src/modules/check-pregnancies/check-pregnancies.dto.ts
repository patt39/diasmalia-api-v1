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
  @IsNotEmpty()
  @IsString()
  date: Date;

  @IsNotEmpty()
  @IsString()
  codeFemale: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  note: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  farrowingDate: Date;

  @IsNotEmpty()
  @IsString()
  @IsEnum(MethodCheckPregnancy)
  method: MethodCheckPregnancy;

  @IsNotEmpty()
  @IsString()
  @IsEnum(ResultCheckPregnancy)
  result: ResultCheckPregnancy;

  @IsNotEmpty()
  @IsString()
  @IsUUID()
  breedingId: string;
}
