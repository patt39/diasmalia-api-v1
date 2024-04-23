import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateOrUpdateAnimalTypesDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  icon: string;
}
