import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class CreateOrUpdateWeaningsDto {
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
  date: Date;

  @IsNotEmpty()
  @IsString()
  @IsUUID()
  animalId: string;
}
