import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

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
