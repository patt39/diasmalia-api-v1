import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateOrUpdateHealthsDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  image: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  animalTypeId: string;

  @IsOptional()
  @IsString()
  category: string;
}

export class SelectMedecinesDto {
  @IsNotEmpty()
  @IsArray()
  medecines: any;
}

export class GetHealthQueryDto {
  @IsOptional()
  @IsString()
  @IsUUID()
  animalTypeId: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  organizationId: string;

  @IsOptional()
  @IsString()
  category: string;

  @IsOptional()
  @IsString()
  @IsIn(['true', 'false'])
  status: string;
}
