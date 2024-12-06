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
  organizationId: string;

  @IsOptional()
  @IsString()
  @IsIn(['true', 'false'])
  status: string;
}
