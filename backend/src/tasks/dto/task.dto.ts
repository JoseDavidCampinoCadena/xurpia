import { IsString, IsOptional, IsIn, IsInt } from 'class-validator';
import { TaskStatus } from '@prisma/client';

export class CreateTaskDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @IsIn(['PENDING', 'IN_PROGRESS', 'COMPLETED'])
  status?: TaskStatus;

  @IsInt()
  projectId: number;

  @IsInt()
  assigneeId: number;
}

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @IsIn(['PENDING', 'IN_PROGRESS', 'COMPLETED'])
  status?: TaskStatus;

  @IsInt()
  @IsOptional()
  assigneeId?: number;

  @IsInt()
  @IsOptional()
  projectId?: number;
} 