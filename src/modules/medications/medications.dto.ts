import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateOrUpdateMedicationsDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;
}
