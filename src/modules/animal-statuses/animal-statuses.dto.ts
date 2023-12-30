import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateOrUpdateAnimalStatusesDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  title: string;

  @IsNotEmpty()
  @IsString()
  color: string;
}
