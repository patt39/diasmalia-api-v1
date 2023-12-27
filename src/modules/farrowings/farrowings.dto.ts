import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class CreateOrUpdateFarrowingsDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  litter: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  note: string;

  @IsNotEmpty()
  @IsString()
  @IsUUID()
  checkPregnancyId: string;

  @IsNotEmpty()
  @IsString()
  @IsUUID()
  animalId: string;
}
