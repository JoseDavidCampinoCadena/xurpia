import { IsString, IsArray } from 'class-validator';

export class RecommendUsersDto {
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
