import { TaskStatus } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateOrUpdateTasksDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  dueDate: Date;

  @IsOptional()
  @IsString()
  @MaxLength(100)
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
  @MaxLength(100)
  @IsEnum(TaskStatus)
  status: TaskStatus;
}
