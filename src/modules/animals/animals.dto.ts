import { Gender, ProductionPhase } from '@prisma/client';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsIn,
  IsUUID,
} from 'class-validator';

export class CreateOrUpdateAnimalsDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  code: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  codeFather: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  codeMother: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  weight: string;

  @IsNotEmpty()
  @IsString()
  birthday: Date;

  @IsNotEmpty()
  @IsString()
  @IsIn([Gender])
  gender: Gender;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @IsIn([ProductionPhase])
  productionPhase: ProductionPhase;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  electronicCode: string;

  @IsNotEmpty()
  @IsString()
  @IsUUID()
  animalStatusId: string;

  @IsNotEmpty()
  @IsString()
  @IsUUID()
  locationId: string;

  @IsNotEmpty()
  @IsString()
  @IsUUID()
  breedId: string;
}
