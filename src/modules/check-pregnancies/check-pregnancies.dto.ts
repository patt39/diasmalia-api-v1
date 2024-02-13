import { MethodCheckPregnancy, ResultCheckPregnancy } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateOrUpdateCheckPregnanciesDto {
  @IsNotEmpty()
  @IsString()
  date: Date;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  codeFemale: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  note: string;

  @IsNotEmpty()
  @IsString()
  farrowingDate: Date;

  @IsNotEmpty()
  @IsString()
  @IsEnum(MethodCheckPregnancy)
  method: MethodCheckPregnancy;

  @IsNotEmpty()
  @IsString()
  @IsEnum(ResultCheckPregnancy)
  result: ResultCheckPregnancy;
}
