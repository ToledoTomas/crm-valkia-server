import { IsOptional, IsString } from 'class-validator';

export class SearchCustomerDto {
  @IsOptional()
  @IsString()
  fullname?: string;
}
