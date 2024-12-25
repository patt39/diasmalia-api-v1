import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateBreedingsDto {
  @IsNotEmpty()
  @IsString()
  codeMale: string;

  @IsNotEmpty()
  @IsString()
  codeFemale: string;

  @IsOptional()
  @IsString()
  note: string;

  @IsNotEmpty()
  @IsString()
  method: string;
}

export class UpdateBreedingsDto {
  @IsOptional()
  @IsString()
  codeMale: string;

  @IsOptional()
  @IsString()
  codeFemale: string;

  @IsOptional()
  @IsString()
  note: string;

  @IsOptional()
  @IsString()
  method: string;
}

export class GetAnimalBreedingsDto {
  @IsOptional()
  @IsString()
  @IsUUID()
  animalFemaleId: string;
}

export class GetAnimalBreedingsQueryDto {
  @IsOptional()
  @IsString()
  periode: string;

  @IsOptional()
  @IsString()
  method: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  animalTypeId: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  animalFemaleId: string;
}
