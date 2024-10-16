import { AnimalTypeStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateOrUpdateAnimalTypesDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  slug: string;

  @IsNotEmpty()
  @IsString()
  habitat: string;

  @IsOptional()
  @IsString()
  @IsEnum(AnimalTypeStatus)
  status: AnimalTypeStatus;
}

export class GetAnimalTypesByStatusQuery {
  @IsOptional()
  @IsString()
  @IsEnum(AnimalTypeStatus)
  status: AnimalTypeStatus;
}
