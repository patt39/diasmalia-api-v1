import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateOrUpdateFinancialDetailDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;
}
