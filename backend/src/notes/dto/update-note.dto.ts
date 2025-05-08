import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class UpdateNoteDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}
