import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateOrUpdateBreedsDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  animalTypeName: string;
}

export class GetBreedsTypeDto {
  @IsOptional()
  @IsString()
  @IsUUID()
  animalTypeId: string;
}
