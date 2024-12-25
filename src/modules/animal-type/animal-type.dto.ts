import { IsIn, IsOptional, IsString } from 'class-validator';

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
}

export class GetAnimalTypesByStatusQuery {
  @IsOptional()
  @IsString()
  @IsIn(['true', 'false'])
  status: string;
}
