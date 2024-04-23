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

  @IsOptional()
  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsString()
  birthday: Date;

  @IsOptional()
  @IsString()
  @IsEnum(Gender)
  gender: Gender;

  @IsOptional()
  @IsString()
  @IsEnum(ProductionPhase)
  productionPhase: ProductionPhase;

  @IsOptional()
  @IsString()
  electronicCode: string;

  @IsNotEmpty()
  @IsString()
  @IsUUID()
  locationId: string;

  @IsOptional()
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

  @IsOptional()
  @IsString()
  @IsUUID()
  animalTypeId: string;
}
