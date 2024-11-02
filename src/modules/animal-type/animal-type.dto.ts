import { AnimalTypeStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateOrUpdateAnimalTypesDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  slug: string;

  @IsOptional()
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
