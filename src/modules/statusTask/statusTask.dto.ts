import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateOrUpdateStatusTasksDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;
}
