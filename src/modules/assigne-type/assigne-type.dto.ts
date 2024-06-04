import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateOrUpdateAssignTypesDto {
  @IsNotEmpty()
  @IsUUID()
  animalTypeId: string;
}

export class BulkCreateAssignTypesDto {
  @IsNotEmpty()
  @IsArray()
  animalTypeIds: any;
}

export class GetAssignTasksDto {
  @IsOptional()
  @IsString()
  @IsUUID()
  animalTypeId: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  userId: string;
}
