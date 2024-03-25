import { MedicationTypes, MethodTreatment } from '@prisma/client';

import {
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateOrUpdateTreatmentsDto {
  @IsNotEmpty()
  @IsInt()
  dose: number;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  diagnosis: string;

  @IsNotEmpty()
  @IsString()
  @IsDate()
  date: Date;

  @IsNotEmpty()
  @IsString()
  @IsUUID()
  batchId: string;

  @IsOptional()
  @IsString()
  note: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @IsEnum(MethodTreatment)
  method: MethodTreatment;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @IsEnum(MedicationTypes)
  medication: MedicationTypes;
}
