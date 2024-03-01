import { AnimalType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateOrUpdateBreedsDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  @IsEnum(AnimalType)
  type: AnimalType;
}

export class GetBreedsTypeDto {
  @IsOptional()
  @IsString()
  @IsEnum(AnimalType)
  type: AnimalType;
}
