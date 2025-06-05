import { IsNumber, IsString, IsOptional } from 'class-validator';

export class DistributeTasksDto {
  @IsNumber()
  projectId: number;

  @IsString()
  @IsOptional()
  criteria?: string; // AI criteria for task distribution (e.g., "based on skills", "workload balance")
}
