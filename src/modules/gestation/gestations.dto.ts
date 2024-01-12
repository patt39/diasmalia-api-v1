import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class CreateOrUpdateGestationsDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  note: string;

  @IsNotEmpty()
  @IsString()
  @IsUUID()
  animalId: string;

  @IsNotEmpty()
  @IsString()
  @IsUUID()
  checkPregnancyId: string;
}
