import { MethodCheckPregnancy, ResultCheckPregnancy } from '@prisma/client';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsEnum,
  IsUUID,
} from 'class-validator';

export class CreateOrUpdateCheckPregnanciesDto {
  @IsNotEmpty()
  @IsString()
  date: Date;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  note: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  farrowingDate: Date;

  @IsOptional()
  @IsString()
  @IsEnum([MethodCheckPregnancy])
  method: MethodCheckPregnancy;

  @IsOptional()
  @IsString()
  @IsEnum([ResultCheckPregnancy])
  result: ResultCheckPregnancy;

  @IsNotEmpty()
  @IsString()
  @IsUUID()
  breedingId: string;
}
