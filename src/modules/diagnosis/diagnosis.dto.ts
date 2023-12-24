import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateOrUpdateDiagnosisDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;
}
