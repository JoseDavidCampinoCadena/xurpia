import { IsNotEmpty, IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateNoteDto {
  @IsNotEmpty()
  @IsString()
  texto: string;

  @IsOptional()
  @IsBoolean()
  completado?: boolean;
}