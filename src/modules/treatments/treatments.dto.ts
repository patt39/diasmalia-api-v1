import { MethodTreatment } from '@prisma/client';

import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsUUID,
  IsInt,
  IsOptional,
  IsEnum,
} from 'class-validator';

export class CreateOrUpdateTreatmentsDto {
  @IsNotEmpty()
  @IsInt()
  numberOfDose: number;

  @IsNotEmpty()
  @IsString()
  treatmentName: string;

  @IsNotEmpty()
  @IsString()
  treatmentDate: Date;

  @IsNotEmpty()
  @IsString()
  @IsUUID()
  medicationId: string;

  @IsNotEmpty()
  @IsString()
  @IsUUID()
  diagnosisId: string;

  @IsNotEmpty()
  @IsString()
  @IsUUID()
  animalId: string;

  @IsOptional()
  @IsString()
  note: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @IsEnum(MethodTreatment)
  method: MethodTreatment;
}
