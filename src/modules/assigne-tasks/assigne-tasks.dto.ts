import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateOrUpdateAssignTasksDto {
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  taskId: string;

  @IsNotEmpty()
  @IsString()
  @IsUUID()
  userId: string;
}

export class GetAssignTasksDto {
  @IsOptional()
  @IsString()
  @IsUUID()
  taskId: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  userId: string;
}
