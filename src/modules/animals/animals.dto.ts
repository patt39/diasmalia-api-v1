import {
  AnimalStatus,
  CastratedStatus,
  Gender,
  IsolatedStatus,
  ProductionPhase,
} from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateAnimalsDto {
  @IsOptional()
  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  codeFather: string;

  @IsOptional()
  @IsString()
  codeMother: string;

  @IsOptional()
  @IsNumber()
  weight: number;

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

  @IsOptional()
  @IsString()
  locationCode: string;

  @IsNotEmpty()
  @IsString()
  breedName: string;
}

export class UpdateAnimalsDto {
  @IsOptional()
  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  codeFather: string;

  @IsOptional()
  @IsString()
  codeMother: string;

  @IsOptional()
  @IsNumber()
  weight: number;

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
  @IsEnum(CastratedStatus)
  isCastrated: CastratedStatus;

  @IsOptional()
  @IsString()
  electronicCode: string;

  @IsOptional()
  @IsString()
  locationCode: string;

  @IsOptional()
  @IsString()
  breedName: string;
}

export class CreateOrUpdateAvesDto {
  @IsOptional()
  @IsString()
  code: string;

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
  @IsEnum(ProductionPhase)
  productionPhase: ProductionPhase;

  @IsOptional()
  @IsString()
  electronicCode: string;

  @IsOptional()
  @IsString()
  locationCode: string;

  @IsOptional()
  @IsNumber()
  female: number;

  @IsOptional()
  @IsNumber()
  male: number;
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
  @IsEnum(IsolatedStatus)
  isIsolated: IsolatedStatus;

  @IsOptional()
  @IsString()
  @IsUUID()
  animalTypeId: string;
}
