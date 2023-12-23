import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';

export class CreateOrUpdateTasksDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  title: string;

  @IsOptional()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  dueDate: Date;
}
