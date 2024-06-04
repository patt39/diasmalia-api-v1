import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateOrUpdateWeaningsDto {
  @IsNotEmpty()
  @IsNumber()
  litter: number;

  @IsNotEmpty()
  @IsString()
  codeFemale: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  farrowingId: string;
}

export class WeaningDto {
  @IsOptional()
  @IsString()
  @IsUUID()
  animalTypeId: string;
}
