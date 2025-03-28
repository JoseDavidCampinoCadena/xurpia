import { IsString, IsEmail, IsEnum, IsNumber } from 'class-validator';

export enum CollaboratorRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export class AddCollaboratorDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsEnum(CollaboratorRole)
  role: CollaboratorRole;

  @IsNumber()
  projectId: number;

  @IsString() // ✅ Agregar este campo
  projectName: string;
}

export class UpdateCollaboratorDto {
  @IsEnum(CollaboratorRole)
  role: CollaboratorRole;
}
