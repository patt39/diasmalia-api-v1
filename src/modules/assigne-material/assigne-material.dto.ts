import { MaterialType } from '@prisma/client';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export class GetAssignMaterialsDto {
  @IsOptional()
  @IsString()
  @IsUUID()
  buildingId: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  locationId: string;

  @IsOptional()
  @IsString()
  @IsEnum(MaterialType)
  type: MaterialType;
}
