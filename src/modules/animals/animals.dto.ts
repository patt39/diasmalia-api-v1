import {
  AnimalStatus,
  CastratedStatus,
  Gender,
  IsolatedStatus,
} from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
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

  @IsNotEmpty()
  @IsNumber()
  weight: number;

  @IsNotEmpty()
  @IsString()
  birthday: Date;

  @IsOptional()
  @IsString()
  @IsEnum(Gender)
  gender: Gender;

  @IsNotEmpty()
  @IsString()
  productionPhase: string;

  @IsNotEmpty()
  @IsString()
  locationCode: string;

  @IsNotEmpty()
  @IsString()
  breedName: string;
}

export class BulkAnimalsCreateDto {
  @IsNotEmpty()
  @IsNumber()
  number: number;

  @IsOptional()
  @IsString()
  codeFather: string;

  @IsOptional()
  @IsString()
  codeMother: string;

  @IsNotEmpty()
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
  productionPhase: string;

  @IsNotEmpty()
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
  @IsNumber()
  female: number;

  @IsOptional()
  @IsNumber()
  male: number;

  @IsOptional()
  @IsString()
  codeFather: string;

  @IsOptional()
  @IsString()
  codeMother: string;

  @IsOptional()
  @IsString()
  strain: string;

  @IsOptional()
  @IsString()
  supplier: string;

  @IsOptional()
  @IsNumber()
  weight: number;

  @IsOptional()
  @IsString()
  birthday: Date;

  @IsOptional()
  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsString()
  @IsEnum(Gender)
  gender: Gender;

  @IsOptional()
  @IsString()
  productionPhase: string;

  @IsOptional()
  @IsString()
  @IsEnum(CastratedStatus)
  isCastrated: CastratedStatus;

  @IsOptional()
  @IsString()
  locationCode: string;

  @IsOptional()
  @IsString()
  breedName: string;
}

export class CreateAvesDto {
  @IsOptional()
  @IsString()
  code: string;

  @IsOptional()
  @IsNumber()
  weight: number;

  @IsOptional()
  @IsNumber()
  quantity: number;

  @IsNotEmpty()
  @IsString()
  birthday: Date;

  @IsOptional()
  @IsString()
  strain: string;

  @IsOptional()
  @IsString()
  supplier: string;

  @IsNotEmpty()
  @IsString()
  productionPhase: string;

  @IsNotEmpty()
  @IsString()
  locationCode: string;

  @IsOptional()
  @IsNumber()
  female: number;

  @IsOptional()
  @IsNumber()
  male: number;

  @IsOptional()
  @IsString()
  breedName: string;
}

export class GetAnimalsQuery {
  @IsOptional()
  @IsString()
  productionPhase: string;

  @IsOptional()
  @IsString()
  @IsEnum(Gender)
  gender: Gender;

  @IsOptional()
  @IsString()
  periode: string;

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

  @IsOptional()
  @IsString()
  @IsUUID()
  locationId: string;
}
