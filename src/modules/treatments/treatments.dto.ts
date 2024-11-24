import {
  IsArray,
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
  method: string;

  @IsNotEmpty()
  @IsString()
  @IsUUID()
  healthId: string;
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

  @IsNotEmpty()
  @IsString()
  method: string;

  @IsNotEmpty()
  @IsString()
  @IsUUID()
  healthId: string;
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
