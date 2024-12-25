import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateOrSuggestionDto {
  @IsNotEmpty()
  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  code: string;
}
