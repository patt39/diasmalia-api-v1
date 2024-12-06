import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateOrSuggestionDto {
  @IsNotEmpty()
  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  code: string;
}

export class GetSuggestionsQueryDto {
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  userId: string;
}
