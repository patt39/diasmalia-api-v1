import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsUUID,
  IsInt,
  IsOptional,
} from 'class-validator';

export class CreateOrUpdateTreatmentsDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @IsInt()
  numberOfDose: number;

  @IsNotEmpty()
  @IsString()
  @IsUUID()
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
}
