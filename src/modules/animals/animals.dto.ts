import { AnimalStatus, Gender, ProductionPhase } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
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
  @IsNumber()
  weight: number;

  @IsNotEmpty()
  @IsString()
  birthday: Date;

  @IsNotEmpty()
  @IsString()
  @IsEnum(Gender)
  gender: Gender;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @IsEnum(ProductionPhase)
  productionPhase: ProductionPhase;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  electronicCode: string;

  @IsNotEmpty()
  @IsString()
  @IsUUID()
  locationId: string;

  @IsNotEmpty()
  @IsString()
  @IsUUID()
  animalTypeId: string;

  @IsNotEmpty()
  @IsString()
  @IsUUID()
  breedId: string;
}

export class GetAnimalsQuery {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @IsEnum(ProductionPhase)
  productionPhase: ProductionPhase;

  @IsOptional()
  @IsString()
  @IsEnum(Gender)
  gender: Gender;

  @IsOptional()
  @IsString()
  @IsEnum(AnimalStatus)
  status: AnimalStatus;

  @IsNotEmpty()
  @IsString()
  @IsUUID()
  animalTypeId: string;
}
