import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateOrUpdateTasksDto {
  @IsOptional()
  @IsString()
  type: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  periode: string;

  @IsOptional()
  @IsString()
  frequency: string;

  @IsNotEmpty()
  @IsString()
  @IsUUID()
  animalTypeId: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  dueDate: Date;

  @IsNotEmpty()
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
}
