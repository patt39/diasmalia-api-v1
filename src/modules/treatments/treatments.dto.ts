import { MedicationTypes, MethodTreatment } from '@prisma/client';

import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateOrUpdateTreatmentsDto {
  @IsOptional()
  @IsNumber()
  dose: number;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  diagnosis: string;

  @IsOptional()
  @IsString()
  code: string;

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
  @IsInt()
  dose: number;

  @IsOptional()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsArray()
  animals: any;

  @IsOptional()
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

  @IsOptional()
  @IsString()
  @IsUUID()
  animalId: string;

  @IsOptional()
  @IsString()
  periode: string;
}
