import { TaskStatus } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateOrUpdateTasksDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  dueDate: Date;

  @IsOptional()
  @IsString()
  @IsEnum(TaskStatus)
  status: TaskStatus;

  @IsNotEmpty()
  @IsString()
  @IsUUID()
  contributorId: string;
}

export class TasksQueryDto {
  @IsOptional()
  @IsString()
  @IsEnum(TaskStatus)
  status: TaskStatus;
}
