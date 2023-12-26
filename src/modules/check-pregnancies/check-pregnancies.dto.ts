import { MethodCheckPregnancy, ResultCheckPregnancy } from '@prisma/client';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsIn,
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

  @IsNotEmpty()
  @IsString()
  @IsIn([MethodCheckPregnancy])
  method: MethodCheckPregnancy;

  @IsNotEmpty()
  @IsString()
  @IsIn([ResultCheckPregnancy])
  result: ResultCheckPregnancy;

  @IsNotEmpty()
  @IsString()
  @IsUUID()
  breedingId: string;
}
