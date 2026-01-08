import { IsOptional, IsString } from 'class-validator';

export class SearchProductDto {
  @IsOptional()
  @IsString()
  name?: string;
}
