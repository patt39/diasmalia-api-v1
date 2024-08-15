import { MethodCheckPregnancy, ResultCheckPregnancy } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateOrUpdateCheckPregnanciesDto {
  @IsOptional()
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

export class checkPregancyQueryDto {
  @IsOptional()
  @IsString()
  @IsUUID()
  animalTypeId: string;
}
