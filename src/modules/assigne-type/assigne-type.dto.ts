import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class BulkCreateAssignTypesDto {
  @IsNotEmpty()
  @IsArray()
  animalTypeIds: any;
}

export class GetAssignTypesDto {
  @IsOptional()
  @IsString()
  @IsUUID()
  animalTypeId: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  userId: string;
}
