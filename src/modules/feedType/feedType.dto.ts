import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateOrUpdateFeedTypesDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;
}
