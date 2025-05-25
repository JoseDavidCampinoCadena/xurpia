import { IsString, IsArray } from 'class-validator';

export class RecommendCollaboratorsDto {
  @IsString()
  interest: string;

  @IsArray()
  users: Array<{
    id: number;
    name: string;
    email: string;
    description?: string;
    gender?: string;
  }>;
}
