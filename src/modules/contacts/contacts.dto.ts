import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateOrUpdateContactsDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @MinLength(3)
  subject: string;

  @IsNotEmpty()
  @IsString()
  description: string;
}
