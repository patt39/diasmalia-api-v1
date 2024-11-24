import { MaterialType } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateOrUpdateMaterialDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  image: string;

  @IsOptional()
  @IsString()
  @IsEnum(MaterialType)
  type: MaterialType;
}

export class GetMaterialQueryDto {
  @IsOptional()
  @IsString()
  @IsEnum(MaterialType)
  type: MaterialType;
}
