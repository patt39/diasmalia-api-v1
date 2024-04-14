import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateOrUpdateBreedsDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  animalTypeId: string;
}

export class GetBreedsTypeDto {
  @IsOptional()
  @IsString()
  @IsUUID()
  animalTypeId: string;
}
