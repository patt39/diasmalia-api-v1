import { MedicationTypes, MethodTreatment } from '@prisma/client';

import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
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
  date: Date;

  @IsNotEmpty()
  @IsString()
  @IsUUID()
  animalId: string;

  @IsOptional()
  @IsString()
  note: string;

  @IsNotEmpty()
  @IsString()
  @IsEnum(MethodTreatment)
  method: MethodTreatment;

  @IsNotEmpty()
  @IsString()
  @IsEnum(MedicationTypes)
  medication: MedicationTypes;
}

export class BulkTreatmentsDto {
  @IsOptional()
  @IsString()
  note: string;

  @IsOptional()
  @IsString()
  diagnosis: string;

  @IsOptional()
  @IsString()
  dose: number;

  @IsOptional()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  date: Date;

  @IsNotEmpty()
  @IsArray()
  animals: any;

  @IsNotEmpty()
  @IsString()
  @IsEnum(MethodTreatment)
  method: MethodTreatment;

  @IsNotEmpty()
  @IsString()
  @IsEnum(MedicationTypes)
  medication: MedicationTypes;
}

export class TreatmentDto {
  @IsOptional()
  @IsString()
  @IsUUID()
  animalTypeId: string;
}
