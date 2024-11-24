import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateOrUpdateTasksDto {
  @IsOptional()
  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  periode: string;

  @IsOptional()
  @IsString()
  frequency: string;

  @IsOptional()
  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  animalTypeId: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  dueDate: Date;

  @IsOptional()
  @IsString()
  @IsUUID()
  contributorId: string;
}

export class TaskQueryDto {
  @IsOptional()
  @IsString()
  @IsUUID()
  contributorId: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  animalTypeId: string;

  @IsOptional()
  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  status: string;
}
